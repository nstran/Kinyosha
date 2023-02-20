import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductComponent } from './product.component';
import { AuthGuard } from '../shared/guards/auth.guard';

import { ListProductComponent } from './components/list-product/list-product.component';
import { CreateProductComponent } from './components/create-product/create-product.component';
import { DetailProductComponent } from './components/detail-product/detail-product.component';
import { PriceListComponent } from './components/price-list/price-list.component';
import { ThanhphamComponent } from './components/thanhpham/thanhpham.component';
import { DetailThanhphamComponent } from './components/detail-thanhpham/detail-thanhpham.component';
import { ListThanhphamComponent } from './components/list-thanhpham/list-thanhpham.component';
import { ListCongCuComponent } from './components/list-congcu/list-congcu.component';
import { ImportExcelNvlComponent } from './components/import-excel-nvl/import-excel-nvl.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ProductComponent,
        children: [
          {
            path: 'list',
            component: ListProductComponent,
            canActivate: [AuthGuard]
          }
          ,
          {
            path: 'create',
            component: CreateProductComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'detail',
            component: DetailProductComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'price-list',
            component: PriceListComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'thanhpham',
            component: ThanhphamComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'detail-thanhpham',
            component: DetailThanhphamComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'list-thanhpham',
            component: ListThanhphamComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'list-congcu',
            component: ListCongCuComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'import-excel-nvl',
            component: ImportExcelNvlComponent,
            canActivate: [AuthGuard]
          }
        ]
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class ProductRouting {
}
