export class ShareInfoEntity {
  resourceId!: string;
  resourceType!: 'post' | 'product';
  shareUrl!: string;
  qrCodeDataUrl?: string;
  meta?: any;

  constructor(props: any) {
    Object.assign(this, props);
  }
}
