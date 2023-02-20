import { Component, OnInit } from '@angular/core';
import { OrganizationService } from "../../../shared/services/organization.service";
import { TreeNode } from 'primeng';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: "app-chon-nhieu-dv-dialog",
  templateUrl: "./chon-nhieu-dv-dialog.component.html",
  styleUrls: ["./chon-nhieu-dv-dialog.component.css"],
  // providers: [DynamicDialogRef, DynamicDialogConfig],
})
export class ChonNhieuDvDialogComponent implements OnInit {
  listAll: Array<any> = [];
  listTree: Array<TreeNode> = [];
  listSelectedNode: Array<TreeNode> = [];
  listSelectedId: Array<string> = [];
  selectedNode: TreeNode = null;
  selectedId: string = null;
  mode: number = 1; //1: Multiple choice, 2: Single choice
  permissionByLogin: boolean = false;
  auth: any = JSON.parse(localStorage.getItem('auth'));
  lstOrganizationId: any = [];

  constructor(
    private organizationService: OrganizationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
    console.log(this.config);
    this.mode = this.config.data.mode;
    if (this.mode == 1) {
      if (this.config.data.listSelectedId?.length > 0) {
        this.listSelectedId = this.config.data.listSelectedId;
      }
    } else if (this.mode == 2) {
      this.selectedId = this.config.data.selectedId;
      console.log(this.selectedId);
    }

    let persion = this.config.data.permissionByLogin;
    if (persion != null && persion != undefined) {
      this.permissionByLogin = persion;
    }
  }

  ngOnInit(): void {
    this.getListDonVi();
  }

  async getListDonVi() {
    let result: any = await this.organizationService.getAllOrganizationAsync();

    if (result.statusCode == 200) {
      this.listAll = result.listAll;

      if (this.permissionByLogin == true) {
        this.lstOrganizationId.push(this.auth.OrganizationId);
        var organizationByLogin = this.listAll.find(o => o.organizationId == this.auth.OrganizationId);
        if (organizationByLogin != null && organizationByLogin != undefined && organizationByLogin.level == 0) {
          this.listTree = this.list_to_tree(this.listAll);
        }
        else {
          this.getParentChilden(this.auth.OrganizationId);

          var orgin = this.listAll.filter(o => this.lstOrganizationId.indexOf(o.organizationId) > -1 || o.parentId == this.auth.OrganizationId);
          this.listTree = this.list_to_tree(orgin);
        }
      }
      else {
        this.listTree = this.list_to_tree(this.listAll);
      }

      //Nếu chọn nhiều
      if (this.mode == 1) {
        if (this.listSelectedId.length > 0) {
          this.selectNodes(
            this.listTree,
            this.listSelectedNode,
            this.listSelectedId
          );
        }
      }
      //Nếu chọn một
      else if (this.mode == 2) {
        if (this.selectedId) {
          this.selectNodes(this.listTree, this.listSelectedNode, [
            this.selectedId,
          ]);
          this.selectedNode = this.listSelectedNode[0];
        }
      }
    } else {
      this.showMessage("error", result.messageCode);
    }
  }

  getParentChilden(id) {
    var organizationByLogin = this.listAll.find(o => o.organizationId == id);
    if (organizationByLogin != null && organizationByLogin != undefined) {
      this.lstOrganizationId.push(organizationByLogin.parentId);
      if (organizationByLogin.level > 0) {
        this.getParentChilden(organizationByLogin.parentId);
      }
    }
  }

  list_to_tree(listData: Array<any>) {
    let list: Array<TreeNode> = [];
    listData.forEach((item) => {
      let node: TreeNode = {
        label: item.organizationName,
        key: item.organizationId,
        expanded: true,
        data: {
          organizationId: item.organizationId,
          parentId: item.parentId,
          isFinancialIndependence: item.isFinancialIndependence,
          level: item.level,
        },
        children: [],
      };

      list = [...list, node];
    });

    var map = {},
      node,
      roots = [],
      i;

    for (i = 0; i < list.length; i += 1) {
      map[list[i].data.organizationId] = i; // initialize the map
      list[i].children = []; // initialize the children
    }

    for (i = 0; i < list.length; i += 1) {
      node = list[i];
      //if (this.permissionByLogin == false) {
        if (node.data.level !== 0) {
          // if you have dangling branches check that map[node.parentId] exists
          list[map[node.data.parentId]]?.children.push(node);
        } else {
          roots.push(node);
        }
      //}
      //else {
      //  roots.push(node);
      //}
    }
    return roots;
  }

  nodeSelect(event) {}

  nodeUnselect(event) {}

  cancel() {
    this.ref.close();
  }

  chon() {
    //Nếu chọn nhiều
    if (this.mode == 1) {
      let listId = this.listSelectedNode.map((x) => x.data.organizationId);
      let listSelected = this.listAll.filter((x) =>
        listId.includes(x.organizationId)
      );
      this.ref.close(listSelected);
    }
    //Nếu chọn một
    else if (this.mode == 2) {
      let selected = this.listAll.find(
        (x) => x.organizationId == this.selectedNode?.data?.organizationId
      );
      let listSelected = [];
      if (selected) {
        listSelected = [selected];
      }

      this.ref.close(listSelected);
    }
  }

  selectNodes(tree: TreeNode[], checkedNodes: TreeNode[], keys: Array<any>) {
    // Iterate through each node of the tree and select nodes
    let count = tree.length;
    for (const node of tree) {
      // If the current nodes key is in the list of keys to select, or it's parent is selected then select this node as well
      if (keys.includes(node.key)) {
        checkedNodes.push(node);
        count--;
      }

      // Look at the current node's children as well
      if (node.children) this.selectNodes(node.children, checkedNodes, keys);
    }
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: "Thông báo:", detail: detail };
    this.messageService.add(msg);
  }
}
