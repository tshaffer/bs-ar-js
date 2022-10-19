declare module '@brightsign' {
  
  global {

    export class BSMessagePort {
      onbsmessage: (message: {data: any}) => void;
      PostBSMessage(message: object): void;
    }

    export class BSControlPort {
      constructor(portName: string);
      SetPinValue(button: number, output: number): void;
      oncontroldown(event: any): void;
    }

    export class BSTicker {
      constructor(x: number, y: number, w: number, h: number, r: number);
      AddString(s: string): void;
      SetBackgroundColor(argb: number): void;
      SetForegroundColor(argb: number): void;
      SetSeparatorString(setSeparatorString: string): void;
    }

    export class BSIRReceiver {
      constructor(interface: string, encoding: string);
      onremotedown(event: any): void;
      onremoteUp(event: any): void;
    }
  }
}
