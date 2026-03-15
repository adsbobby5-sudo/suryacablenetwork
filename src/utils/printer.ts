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
              
              const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
              if (a < 128 || luminance > 128) {
                byte |= (0 << (7 - bit));
              } else {
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

  public isConnected(): boolean {
    return this.device?.gatt?.connected ?? false;
  }

  public async connect(): Promise<void> {
    if (this.isConnected()) return;

    try {
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Standard POS generic service
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Mini thermal printers (e.g. MPT-2)
          '49535343-fe7d-4ae5-8fa9-9fafd205e455'  // Serial Port Profile
        ]
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        console.log('Printer disconnected');
        this.characteristic = null;
      });

      if (!this.device.gatt) throw new Error("Bluetooth GATT unavailable.");
      const server = await this.device.gatt.connect();

      const services = await server.getPrimaryServices();
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.writeWithoutResponse || char.properties.write) {
            this.characteristic = char;
            break;
          }
        }
        if (this.characteristic) break;
      }

      if (!this.characteristic) {
        throw new Error("No writable characteristic found.");
      }
    } catch (error: any) {
      this.device = null;
      this.characteristic = null;
      if (error.message && error.message.includes('Web Bluetooth API globally disabled')) {
         throw new Error('Your browser has Web Bluetooth disabled. If using Chrome, go to chrome://flags/#enable-web-bluetooth and enable it.');
      }
      if (error.name !== 'NotFoundError' && error.message !== 'User cancelled the requestDevice() chooser.') {
        throw new Error(`Connection Failed: ${error.message}`);
      }
      throw error;
    }
  }

  public async print(receiptText: string): Promise<void> {
    if (!this.isConnected() || !this.characteristic) {
      throw new Error("Printer not connected. Please connect first.");
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
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
        // Add a small delay between writes to allow the printer's buffer to process, especially for image rasters
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    } catch (error: any) {
      console.error("Print Error: ", error);
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
