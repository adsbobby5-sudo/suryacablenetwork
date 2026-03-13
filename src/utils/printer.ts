export async function connectAndPrint(receiptText: string): Promise<void> {
  try {
    // 1. Request Bluetooth Device
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }], // Common generic printer service pattern
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // Standard POS generic service
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Mini thermal printers (e.g. MPT-2)
        '49535343-fe7d-4ae5-8fa9-9fafd205e455'  // Serial Port Profile
      ],
      acceptAllDevices: true // Fallback to list everything
    });

    if (!device.gatt) throw new Error("Bluetooth GATT unavailable on device.");
    console.log(`Connecting to GATT Server on ${device.name}...`);
    const server = await device.gatt.connect();

    // 2. Discover Services and Find the Write Characteristic
    console.log("Discovering Services...");
    const services = await server.getPrimaryServices();
    let writeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
    
    // We iterate to find a characteristic that supports 'writeWithoutResponse' or 'write'
    for (const service of services) {
      const characteristics = await service.getCharacteristics();
      for (const characteristic of characteristics) {
        if (characteristic.properties.writeWithoutResponse || characteristic.properties.write) {
          writeCharacteristic = characteristic;
          break;
        }
      }
      if (writeCharacteristic) break;
    }

    if (!writeCharacteristic) {
      throw new Error("No writable characteristic found on this printer.");
    }

    // 3. Prepare ESC/POS Payload
    const encoder = new TextEncoder();
    
    // Commands
    const INIT = [0x1B, 0x40]; // Initialize printer
    const ALIGN_CENTER = [0x1B, 0x61, 0x01]; // Center text
    const ALIGN_LEFT = [0x1B, 0x61, 0x00]; // Left align text
    const BOLD_ON = [0x1B, 0x45, 0x01]; // Emphasized mode ON
    const BOLD_OFF = [0x1B, 0x45, 0x00]; // Emphasized mode OFF
    const FEED_AND_CUT = [0x0A, 0x0A, 0x0A, 0x0A, 0x1D, 0x56, 0x41, 0x00]; // Feed 4 lines and full cut (GS V A 0)

    // Example sequence
    const dataArray: number[] = [];
    dataArray.push(...INIT);
    dataArray.push(...ALIGN_CENTER);
    dataArray.push(...BOLD_ON);

    // Parse the receipt text line by line and construct byte array
    const lines = receiptText.split('\n');
    let isHeader = true;

    for (const line of lines) {
      // If we see the first empty line, turn off bold and center align
      if (line.trim() === '' && isHeader) {
        isHeader = false;
        dataArray.push(...BOLD_OFF);
        dataArray.push(...ALIGN_LEFT);
        dataArray.push(0x0A); // Newline
        continue;
      }
      
      const encodedLine = encoder.encode(line + '\n');
      for (let i = 0; i < encodedLine.length; i++) {
        dataArray.push(encodedLine[i]);
      }
    }

    // End sequence
    dataArray.push(...FEED_AND_CUT);

    const payload = new Uint8Array(dataArray);

    // 4. Send Payload (Chunked to prevent dropping data on BLE)
    console.log("Sending data to printer...");
    const chunkSize = 100;
    for (let i = 0; i < payload.length; i += chunkSize) {
      const chunk = payload.slice(i, i + chunkSize);
      await writeCharacteristic.writeValue(chunk);
    }
    console.log("Print job completed.");
    
    // 5. Disconnect
    device.gatt.disconnect();
    
  } catch (error: any) {
    console.error("Printer Error: ", error);
    // Suppress user cancellation errors so it doesn't alert loudly
    if (error.name !== 'NotFoundError' && error.message !== 'User cancelled the requestDevice() chooser.') {
      alert(`Print Failed: ${error.message || 'Ensure your printer is powered on and paired.'}`);
    }
    throw error;
  }
}
