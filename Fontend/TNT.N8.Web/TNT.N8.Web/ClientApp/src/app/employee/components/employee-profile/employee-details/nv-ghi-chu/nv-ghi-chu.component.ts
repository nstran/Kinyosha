import { ForderConfigurationService } from './../../../../../admin/components/folder-configuration/services/folder-configuration.service';
import { NoteService } from './../../../../../shared/services/note.service';
import { NoteDocumentModel } from './../../../../../shared/models/note-document.model';
import { NoteModel } from './../../../../../shared/models/note.model';
import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EmployeeService } from './../../../../services/employee.service';
import * as $ from 'jquery';
import { FileUpload } from 'primeng/fileupload';

interface NoteDocument {
  active: boolean;
  base64Url: string;
  createdById: string;
  createdDate: Date;
  documentName: string;
  documentSize: string;
  documentUrl: string;
  noteDocumentId: string;
  noteId: string;
  updatedById: string;
  updatedDate: Date;
}

interface Note {
  active: boolean;
  createdById: string;
  createdDate: Date;
  description: string;
  noteDocList: Array<NoteDocument>;
  listFile: Array<FileInFolder>
  noteId: string;
  noteTitle: string;
  objectId: string;
  objectType: string;
  responsibleAvatar: string;
  responsibleName: string;
  type: string;
  updatedById: string;
  updatedDate: Date;
}

class FileInFolder {
  fileInFolderId: string;
  folderId: string;
  fileName: string;
  objectId: string;
  objectType: string;
  size: string;
  active: boolean;
  fileExtension: string;
  createdById: string;
  createdDate: Date;
  uploadByName: string;
}

class FileUploadModel {
  FileInFolder: FileInFolder;
  FileSave: File;
}

@Component({
  selector: 'app-nv-ghi-chu',
  templateUrl: './nv-ghi-chu.component.html',
  styleUrls: ['./nv-ghi-chu.component.css']
})
export class NvGhiChuComponent implements OnInit {
  loading = false;
  isEdit = false;
  @Input() actionEdit: boolean;
  @Input() employeeId: string;

  noteContent: string = '';
  noteHistory: Array<Note> = [];
  noteModel = new NoteModel();
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  uploadedFiles: any[] = [];
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  listNoteDocumentModel: Array<NoteDocumentModel> = [];
  defaultAvatar: string = '/assets/images/no-avatar.png';

  @ViewChild('fileNoteUpload') fileNoteUpload: FileUpload;

  constructor(
    public messageService: MessageService,
    public employeeService: EmployeeService,
    private noteService: NoteService,
    private folderService: ForderConfigurationService,
  ) { }

  ngOnInit(): void {

  }

  async getThongTinGhiChu() {
    if (this.employeeId) {
      this.loading = true;
      let result: any = await this.employeeService.getThongTinGhiChu(this.employeeId);
      this.loading = false;

      if (result.statusCode === 200) {
        this.noteHistory = result.listNote;
        this.handleNoteContent();
      }
      else {
        this.showMessage('error', result.messageCode);
      }
    }
  }

  /* N???u Input c?? thay ?????i */
  ngOnChanges(changes: SimpleChanges) {
    if (this.actionEdit)
      this.getThongTinGhiChu();
  }

  handleNoteContent() {
    this.noteHistory.forEach(element => {
      setTimeout(() => {
        let count = 0;
        if (element.description == null) {
          element.description = "";
        }

        let des = $.parseHTML(element.description);
        let newTextContent = '';
        for (let i = 0; i < des.length; i++) {
          count += des[i].textContent.length;
          newTextContent += des[i].textContent;
        }

        if (count > 250) {
          newTextContent = newTextContent.substr(0, 250) + '<b>...</b>';
          $('#' + element.noteId).find('.short-content').append($.parseHTML(newTextContent));
        } else {
          $('#' + element.noteId).find('.short-content').append($.parseHTML(element.description));
        }

        $('#' + element.noteId).find('.full-content').append($.parseHTML(element.description));
      }, 1000);
    });
  }

  /*Event Th??m c??c file ???????c ch???n v??o list file*/
  handleFile(event) {
    for (let file of event.files) {
      let size: number = file.size;
      let type: string = file.type;

      if (size <= 10000000) {
        if (type.indexOf('/') != -1) {
          type = type.slice(0, type.indexOf('/'));
        }
        if (this.strAcceptFile.includes(type) && type != "") {
          this.uploadedFiles.push(file);
        } else {
          let subType = file.name.slice(file.name.lastIndexOf('.'));
          if (this.strAcceptFile.includes(subType)) {
            this.uploadedFiles.push(file);
          }
        }
      }
    }
  }

  /*Event Khi click x??a t???ng file*/
  removeFile(event) {
    let index = this.uploadedFiles.indexOf(event.file);
    this.uploadedFiles.splice(index, 1);
  }

  /*Event Khi click x??a to??n b??? file*/
  clearAllFile() {
    this.uploadedFiles = [];
  }

  /*L??u file v?? ghi ch?? v??o Db*/
  async saveNote() {
    this.loading = true;

    let noteModel = new NoteModel();
    noteModel.NoteId = this.emptyGuid;
    noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
    noteModel.Type = 'ADD';
    noteModel.ObjectId = this.employeeId;
    noteModel.ObjectType = 'EMP';
    noteModel.NoteTitle = '???? th??m ghi ch??';
    noteModel.Active = true;
    noteModel.CreatedById = this.emptyGuid;
    noteModel.CreatedDate = new Date();

    let listFileNoteUploadModel: Array<FileUploadModel> = [];
    this.uploadedFiles.forEach(item => {
      let fileUpload: FileUploadModel = new FileUploadModel();
      fileUpload.FileInFolder = new FileInFolder();
      fileUpload.FileInFolder.active = true;
      let index = item.name.lastIndexOf(".");
      let name = item.name.substring(0, index);
      fileUpload.FileInFolder.fileName = name;
      fileUpload.FileInFolder.fileExtension = item.name.substring(index + 1);
      fileUpload.FileInFolder.size = item.size;
      fileUpload.FileInFolder.objectId = this.emptyGuid;
      fileUpload.FileInFolder.objectType = 'NOTE';
      fileUpload.FileSave = item;
      listFileNoteUploadModel.push(fileUpload)
    });

    this.noteService.createNoteForObject(noteModel, listFileNoteUploadModel, "QLNV").subscribe(response => {
      let result: any = response;
      this.loading = false;

      if (result.statusCode == 200) {
        /*Reshow Time Line*/
        this.noteHistory = result.listNote;

        this.uploadedFiles = [];
        if (this.fileNoteUpload) {
          this.fileNoteUpload.clear();  //X??a to??n b??? file trong control
        }
        this.noteContent = null;
        this.handleNoteContent();

        this.showMessage('success', 'Th??m ghi ch?? th??nh c??ng');
      }
      else {
        this.showMessage('error', result.messageCode);
      }
    });
  }

  /*Event M??? r???ng/Thu g???n n???i dung c???a ghi ch??*/
  toggle_note_label: string = 'M??? r???ng';
  trigger_node(nodeid: string, event) {
    // noteContent
    let shortcontent_ = $('#' + nodeid).find('.short-content');
    let fullcontent_ = $('#' + nodeid).find('.full-content');
    if (shortcontent_.css("display") === "none") {
      fullcontent_.css("display", "none");
      shortcontent_.css("display", "block");
    } else {
      fullcontent_.css("display", "block");
      shortcontent_.css("display", "none");
    }
    // noteFile
    let shortcontent_file = $('#' + nodeid).find('.short-content-file');
    let fullcontent_file = $('#' + nodeid).find('.full-content-file');
    let continue_ = $('#' + nodeid).find('.continue')
    if (shortcontent_file.css("display") === "none") {
      continue_.css("display", "block");
      fullcontent_file.css("display", "none");
      shortcontent_file.css("display", "block");
    } else {
      continue_.css("display", "none");
      fullcontent_file.css("display", "block");
      shortcontent_file.css("display", "none");
    }
    let curr = $(event.target);

    if (curr.attr('class').indexOf('pi-chevron-right') != -1) {
      this.toggle_note_label = 'Thu g???n';
      curr.removeClass('pi-chevron-right');
      curr.addClass('pi-chevron-down');
    } else {
      this.toggle_note_label = 'M??? r???ng';
      curr.removeClass('pi-chevron-down');
      curr.addClass('pi-chevron-right');
    }
  }
  /*End */

  /*Ki???m tra noteText > 250 k?? t??? ho???c noteDocument > 3 th?? ???n ??i m???t ph???n n???i dung*/
  tooLong(note): boolean {
    if (note.noteDocList.length > 3) return true;
    var des = $.parseHTML(note.description);
    var count = 0;
    for (var i = 0; i < des.length; i++) {
      count += des[i].textContent.length;
      if (count > 250) return true;
    }
    return false;
  }

  /* N???u l?? ???nh th?? m??? tab m???i, n???u l?? t??i li???u th?? download */
  openItem(name, fileExtension, fileInFolderId) {
    this.folderService.downloadFile(fileInFolderId).subscribe(response => {
      let result: any = response;
      this.loading = false;

      if (result.statusCode == 200) {
        var binaryString = atob(result.fileAsBase64);
        var fileType = result.fileType;
        var binaryLen = binaryString.length;
        var bytes = new Uint8Array(binaryLen);
        for (var idx = 0; idx < binaryLen; idx++) {
          var ascii = binaryString.charCodeAt(idx);
          bytes[idx] = ascii;
        }
        var file = new Blob([bytes], { type: fileType });
        if ((window.navigator as any) && (window.navigator as any).msSaveOrOpenBlob) {
          (window.navigator as any).msSaveOrOpenBlob(file);
        } else {
          var fileURL = URL.createObjectURL(file);
          if (fileType.indexOf('image') !== -1) {
            window.open(fileURL);
          } else {
            var anchor = document.createElement("a");
            anchor.download = name.substring(0, name.lastIndexOf('_')) + "." + fileExtension;
            anchor.href = fileURL;
            anchor.click();
          }
        }
      }
      else {
        this.showMessage('error', result.messageCode);
      }
    });
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Th??ng b??o:', detail: detail };
    this.messageService.add(msg);
  }
}
