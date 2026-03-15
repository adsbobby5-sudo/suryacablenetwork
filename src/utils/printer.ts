// Helper to load image and extract monochrome bitmap for ESC/POS
async function getLogoBytes(): Promise<number[]> {
  return new Promise((resolve) => {
    const img = new Image();
    // Use the logo from the public folder
    img.src = '/logo.png';
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve([]);

      // thermal printers are usually 384 dots wide for 58mm
      // Let's make the logo 200 pixels wide
      const targetWidth = 200;
      const scale = targetWidth / img.width;
      const targetHeight = Math.floor(img.height * scale);
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Draw white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      
      // Draw image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const pixels = imgData.data;
      
      // Convert to monochrome 1-bit raster data
      const widthInBytes = Math.ceil(targetWidth / 8);
      const dataArray: number[] = [];
      
      // GS v 0 (Raster bit image)
      dataArray.push(0x1D, 0x76, 0x30, 0x00);
      dataArray.push(widthInBytes % 256, Math.floor(widthInBytes / 256));
      dataArray.push(targetHeight % 256, Math.floor(targetHeight / 256));

      for (let y = 0; y < targetHeight; y++) {
        for (let xByte = 0; xByte < widthInBytes; xByte++) {
          let byte = 0;
          for (let bit = 0; bit < 8; bit++) {
            const x = xByte * 8 + bit;
            if (x < targetWidth) {
              const idx = (y * targetWidth + x) * 4;
              const r = pixels[idx];
              const g = pixels[idx + 1];
              const b = pixels[idx + 2];
              const a = pixels[idx + 3];
              
              // Apply heavy contrast for light colored logos on thermal paper
              // Only practically pure white (luminance > 240) or perfectly transparent (a < 128) pixels remain white
              const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
              if (a < 128 || luminance > 240) {
                // White dot (0) - Paper background
                byte |= (0 << (7 - bit));
              } else {
                // Black dot (1) - Burn marker
                byte |= (1 << (7 - bit));
              }
            }
          }
          dataArray.push(byte);
        }
      }
      resolve(dataArray);
    };
    img.onerror = () => resolve([]);
  });
}

class PrinterService {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private isConnecting: boolean = false;

  public isConnected(): boolean {
    return this.device?.gatt?.connected ?? false;
  }

  public async connect(): Promise<void> {
    if (this.isConnected() && this.characteristic) {
       console.log("Printer already connected and characteristic available.");
       return; // Already good to go
    }

    if (this.isConnecting) {
       console.log("Connection already in progress...");
       return;
    }

    try {
      this.isConnecting = true;
      
      // Only request a new device if we don't have one cached
      if (!this.device) {
        // Try to be as broad as possible for thermal printers.
        // Some devices don't show up if acceptAllDevices is true alongside specific optionalServices in certain Chrome versions.
        this.device = await navigator.bluetooth.requestDevice({
          filters: [
            { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Standard POS
            { services: ['e7810a71-73ae-499d-8c15-faa9aef0c3f2'] }, // MPT-2 Thermal
            { services: ['49535343-fe7d-4ae5-8fa9-9fafd205e455'] }, // Generic Serial Port Profile
            { namePrefix: 'MPT' },
            { namePrefix: 'MTP' },
            { namePrefix: 'Printer' },
            { namePrefix: 'POS' },
            { namePrefix: 'Blue' } // extremely generic fallback for "Bluetooth Printer"
          ],
          optionalServices: [
            '000018f0-0000-1000-8000-00805f9b34fb', 
            'e7810a71-73ae-499d-8c15-faa9aef0c3f2', 
            '49535343-fe7d-4ae5-8fa9-9fafd205e455',
            '00001101-0000-1000-8000-00805f9b34fb' // Serial port profile baseline
          ]
        }).catch(err => {
            // Fallback: If specific filters fail (often throws TypeError if device doesn't support), try absolute generic catch-all
            console.warn("Filtered search failed or cancelled, trying absolute generic search...", err);
            return navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [
                    '000018f0-0000-1000-8000-00805f9b34fb', 
                    'e7810a71-73ae-499d-8c15-faa9aef0c3f2', 
                    '49535343-fe7d-4ae5-8fa9-9fafd205e455',
                    '00001101-0000-1000-8000-00805f9b34fb'
                ]
            });
        });

        this.device.addEventListener('gattserverdisconnected', () => {
          console.warn('Printer disconnected via GATT server event.');
          this.characteristic = null;
          // Note: We keep this.device populated so we can TRY to auto-reconnect later 
          // without popping the chooser again, if the browser supports it.
        });
      }

      if (!this.device.gatt) throw new Error("Bluetooth GATT unavailable on device.");
      
      // If the device is cached but disconnected, connect() will attempt to reconnect
      // without showing the chooser again.
      console.log('Connecting to GATT Server...');
      const server = await this.device.gatt.connect();

      console.log('Getting primary services...');
      const services = await server.getPrimaryServices();
      
      for (const service of services) {
        console.log(`Checking service: ${service.uuid}`);
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.writeWithoutResponse || char.properties.write) {
            console.log(`Found writable characteristic: ${char.uuid}`);
            this.characteristic = char;
            break;
          }
        }
        if (this.characteristic) break;
      }

      if (!this.characteristic) {
        throw new Error("No writable characteristic found on this device.");
      }
      
      console.log('Printer connected successfully!');
    } catch (error: any) {
      // If we failed to reconnect via cache, clear the cache so the next 
      // attempt pops the chooser.
      if (this.device && !this.device.gatt?.connected) {
         console.warn("Failed to reconnect to cached device. Clearing device cache.", error);
         this.device = null;
      }
      
      this.characteristic = null;
      
      if (error.message && error.message.includes('Web Bluetooth API globally disabled')) {
         throw new Error('Your browser has Web Bluetooth disabled. If using Chrome, go to chrome://flags/#enable-web-bluetooth and enable it.');
      }
      
      // If the user simply closed the popup, don't throw a massive localized error
      if (error.name === 'NotFoundError' || error.message.includes('User cancelled')) {
        console.log('User cancelled device selection.');
        throw new Error('User cancelled printer selection.');
      }
      
      throw new Error(`Connection Failed: ${error.message}`);
    } finally {
      this.isConnecting = false;
    }
  }

  public async print(receiptText: string): Promise<void> {
    if (!this.isConnected() || !this.characteristic) {
      // Try to gracefully auto-connect if we have a cached device
      console.log("Printer not connected. Attempting auto-connect...");
      await this.connect();
      
      if (!this.isConnected() || !this.characteristic) {
         throw new Error("Printer not connected. Please connect first.");
      }
    }

    try {
      const encoder = new TextEncoder();
      
      const INIT = [0x1B, 0x40];
      const ALIGN_CENTER = [0x1B, 0x61, 0x01];
      const ALIGN_LEFT = [0x1B, 0x61, 0x00];
      const BOLD_ON = [0x1B, 0x45, 0x01];
      const BOLD_OFF = [0x1B, 0x45, 0x00];
      const FEED_AND_CUT = [0x0A, 0x0A, 0x0A, 0x0A, 0x1D, 0x56, 0x41, 0x00];

      const dataArray: number[] = [];
      dataArray.push(...INIT);
      dataArray.push(0x0A, 0x0A);
      dataArray.push(...ALIGN_CENTER);
      
      const logoBytes = await getLogoBytes();
      if (logoBytes.length > 0) {
         dataArray.push(...logoBytes);
         dataArray.push(0x0A);
      }

      dataArray.push(...BOLD_ON);

      const lines = receiptText.split('\n');
      let isHeader = true;

      for (const line of lines) {
        if (line.trim() === '' && isHeader) {
          isHeader = false;
          dataArray.push(...BOLD_OFF);
          dataArray.push(...ALIGN_LEFT);
          dataArray.push(0x0A);
          continue;
        }
        
        const encodedLine = encoder.encode(line + '\n');
        for (let i = 0; i < encodedLine.length; i++) {
          dataArray.push(encodedLine[i]);
        }
      }

      dataArray.push(...FEED_AND_CUT);

      const payload = new Uint8Array(dataArray);

      // 4. Send Payload (Chunked with small MTU and delays to prevent GATT buffer overflow)
      console.log(`Sending ${payload.length} bytes to printer...`);
      // Standard BLE packet size is ~20 bytes without MTU negotiation
      const chunkSize = 20; 
      
      const writeData = async () => {
         for (let i = 0; i < payload.length; i += chunkSize) {
           const chunk = payload.slice(i, i + chunkSize);
           if (!this.characteristic) throw new Error("Connection lost during print");
           await this.characteristic.writeValue(chunk);
           await new Promise(resolve => setTimeout(resolve, 20)); // Delay to prevent GATT buffer overflow
         }
      };

      try {
        await writeData();
      } catch (writeError: any) {
        console.warn("Write failed. Attempting to reconnect and retry...", writeError);
        // If the write failed (e.g. GATT operation failed), clear characteristic and try to connect again
        this.characteristic = null;
        await this.connect(); // Wait for reconnection
        
        if (!this.characteristic) {
           throw new Error("Failed to recover printing connection.");
        }
        
        // Retry write once
        console.log("Retrying print after recovery...");
        await writeData();
      }
      
      console.log("Print job completed successfully.");
    } catch (error: any) {
      console.error("Print Error: ", error);
      
      if (error.message.includes('User cancelled')) {
         throw error; // Bubble up user cancellations directly
      }
      
      throw new Error(`Print Failed: ${error.message}`);
    }
  }

  public disconnect(): void {
    if (this.isConnected()) {
      this.device?.gatt?.disconnect();
    }
  }
}

export const thermalPrinter = new PrinterService();
