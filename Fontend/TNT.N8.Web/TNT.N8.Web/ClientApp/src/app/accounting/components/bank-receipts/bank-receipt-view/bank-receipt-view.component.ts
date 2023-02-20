import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountingService } from '../../../services/accounting.service'
import { FormGroup } from '@angular/forms';
import { BankReceiptModel } from '../../../models/bankReceipt.model';

import { GetPermission } from '../../../../shared/permission/get-permission';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-bank-receipt-view',
  templateUrl: './bank-receipt-view.component.html',
  styleUrls: ['./bank-receipt-view.component.css']
})
export class BankReceiptViewComponent implements OnInit {

  bankReceiptInvoiceId: string = '';
  ReceiptForm: FormGroup;
  bankReceiptInvoice = new BankReceiptModel();
  createName: string;
  objName: string;
  reasonText: string = "";
  orgText: string = "";
  pricecurrencyText: string = "";
  statusText: string = "";
  bankAccount = '';
  auth: any = JSON.parse(localStorage.getItem('auth'));
  loading: boolean = false;
  actionDownload: boolean = true;
  content : string;
  note : string;
  isSendMail: boolean = false;

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  constructor(
    private getPermission: GetPermission,
    private route: ActivatedRoute,
    private router: Router,
    private accountingService: AccountingService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) { }

  async ngOnInit() {
    let resource = "acc/accounting/bank-receipts-detail/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("download") == -1) {
        this.actionDownload = false;
      }
      this.loading = true;
      this.route.params.subscribe(param => { this.bankReceiptInvoiceId = param["id"] });
      this.getBankReceiptInvoiceId();
    }
  }

  getBankReceiptInvoiceId() {
    this.accountingService.getBankReceiptInvoiceById(this.bankReceiptInvoiceId).subscribe(response => {
      let result = <any>response;
      this.createName = result.createName || '';
      this.objName = result.objectName;
      this.reasonText = result.bankReceiptInvoiceReasonText || '';
      this.orgText = result.organizationText || '';
      this.pricecurrencyText = result.priceCurrencyText;
      this.statusText = result.statusText;
      this.bankAccount = result.bankReceiptTypeText;
      this.bankReceiptInvoice = <BankReceiptModel>{
        BankReceiptInvoiceAmountText: result.bankReceiptInvoice.bankReceiptInvoiceAmountText,
        BankReceiptInvoiceAmount: result.bankReceiptInvoice.bankReceiptInvoiceAmount,
        BankReceiptInvoiceExchangeRate: result.bankReceiptInvoice.bankReceiptInvoiceExchangeRate,
        BankReceiptInvoicePaidDate: result.bankReceiptInvoice.bankReceiptInvoicePaidDate,
        BankReceiptInvoiceCode: result.bankReceiptInvoice.bankReceiptInvoiceCode || '',
        CreatedDate: result.bankReceiptInvoice.createdDate,
        BankReceiptInvoiceDetail: result.bankReceiptInvoice.bankReceiptInvoiceDetail || '',
        BankReceiptInvoiceNote: result.bankReceiptInvoice.bankReceiptInvoiceNote || '',
        BankReceiptInvoicePrice: result.bankReceiptInvoice.bankReceiptInvoicePrice,
        BankReceiptInvoicePriceCurrency: result.bankReceiptInvoice.bankReceiptInvoicePriceCurrency,
        VouchersDate: result.bankReceiptInvoice.VouchersDate,
        IsSendMail: result.bankReceiptInvoice.isSendMail,
      };
      this.isSendMail = this.bankReceiptInvoice.IsSendMail;

      let text = this.bankReceiptInvoice.BankReceiptInvoiceDetail;
      this.content = text.trim().length > 22 ? text.trim().slice(0, 22) + '...' : text.trim();

      let noteTemp = this.bankReceiptInvoice.BankReceiptInvoiceNote;
      this.note = noteTemp.trim().length > 22 ? noteTemp.trim().slice(0, 22) + '...' : noteTemp.trim();

      this.loading = false;
    })
  }
  cancel() {
    this.router.navigate(["/accounting/bank-receipts-list"])
  }

  exportPdf() {
    this.loading = true;
    this.accountingService.exportBankReceiptInvoice(this.bankReceiptInvoiceId, this.auth.UserId).subscribe(response => {
      const result = <any>response;
      if (result.bankReceiptInvoicePdf != null) {
        const binaryString = window.atob(result.bankReceiptInvoicePdf);
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);
        for (let idx = 0; idx < binaryLen; idx++) {
          const ascii = binaryString.charCodeAt(idx);
          bytes[idx] = ascii;
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        const fileName = result.code.replace('/', '-');
        link.download = fileName;
        link.click();
        this.loading = false;
      }
    }, error => { });
  }

  showConfirmDialog() {
    this.confirmationService.confirm({
      message: 'Bạn cho chắc chắn muốn gửi email thông báo xác nhận thanh toán cho khách hàng đã chọn không?',
      accept: () => {
        this.loading = true;
        this.accountingService.confirmPayment(this.bankReceiptInvoiceId, this.auth.UserId, 'bank').subscribe(response => {
            const result = <any>response;
            this.loading = false;
            if (result.statusCode == 202 || result.statusCode == 200) {
              let mgs = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
              this.showMessage(mgs);
              this.getBankReceiptInvoiceId();
            } else {
              let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
              this.showMessage(mgs);
            }
          }, error => { });
      }
    });
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }
}
