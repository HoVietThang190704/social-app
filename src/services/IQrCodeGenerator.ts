export interface IQrCodeGenerator {
  generate(data: string): Promise<string>;
  generateDataUrl(data: string): Promise<string>;
}

export const qrCodeService: IQrCodeGenerator = {
  async generate(data: string) {
    return `data:image/png;base64,`; // stub
  },
  async generateDataUrl(data: string) { return this.generate(data); }
};

export default qrCodeService;