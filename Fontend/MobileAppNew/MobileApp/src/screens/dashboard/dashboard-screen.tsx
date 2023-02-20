import React, {useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Animated, Dimensions,PixelRatio, FlatList, StyleSheet, View, ViewStyle, Text, TextInput, TouchableOpacity, ScrollView, Image, Modal, BackHandler, Alert} from 'react-native';
import {Screen,Toast} from '../../components';
import {useFocusEffect, useIsFocused, useNavigation} from "@react-navigation/native"
import DatePicker from 'react-native-date-picker'
import { Header } from '../../components/header/header';
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import { UnitOfWorkService } from '../../services/api/unitOfWork-service';
import { useStores } from '../../models';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { StorageKey, Storage } from "../../services/storage/index"
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const _unitOfWork = new UnitOfWorkService()
const layout = Dimensions.get('window');
const heightRate = layout.height / 844;
const widthRate = layout.width / 1280;
// const fonsize = Math.round(PixelRatio.roundToNearestPixel(20)) - 2;
const fonsize = (layout.height * 20) / 844;

const ROOT: ViewStyle = {
    backgroundColor: '#E5E5E5',
    flex: 1,
};
type TimeSheetDaily ={
    nv: number;    
    vm: number;
    dm: number;
    vs: number;
    ot: number;   
    user:string;  
    userName:string; 
    gc:string; 
    sg:number;
    tsg:number;
}

type Product = {
    productId: number;
    quantity: number;
    productName: string; 
    loProductionProcess:any;   
} 
type LotData ={
    productId: number,
    lotId:number,
    lotNoName: string,
    customerName: string,
    quantityReached: number,
    statusName: string,
    startDate:Date,
    endDate:Date,
    processStageModels:any
}
//     ProductName: "RC4-3768",
//     Quantity: 4 

type IAllJob = {
    expiry_date: string;
    logo: string;
    job_title: string;
    recruiter_name: string;
    work_name: string;
    location?: string;
}

export const DashboardScreen = observer(function DashboardScreen(props: any) {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const {kinyoshaModel} = useStores();
    const [isLoading, setLoading] = useState(false);
    const [isReport, setIsReport] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const [selectId, setSelectId] = useState(1);
    const [model_about_us, setModel_about_us] = useState(false);
    const [workDate, setWorkDate] = useState(new Date());
    const [workHours, setworkHours] = useState();
    const [totalWorkHours, setTotalWorkHours] = useState();
    const flatListRef = useRef();
    let timeReload = props?.route?.params?.timeReload
    let reloadHeader = props?.route?.params?.reloadHeader

    useEffect(() => {      
        setTimeout(() => {
          
        }, 2000);
    }, []);
    

    useEffect(() => {
      ScrollToTop()
      fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false)
        setLoading(true)
         await kinyoshaModel.setUserInfo({
            firstApp: false
        })
     
      
        let userId = await _unitOfWork.storage.getItem(StorageKey.ID)  
        const _productsData = await _unitOfWork.user.getProductionProductByUserId({UserId:userId});
        getReportDate(workDate);        
        setProducts(_productsData.models); 
        setProductsSearch(_productsData.models);       
        if(_productsData.models.length>0) {
            onSelectProduct(_productsData.models[0])
        }  
        setLoading(false)
    };

    React.useEffect(() => {
        const focusHandler = navigation.addListener('focus', () => {
        });
        return focusHandler;
    }, [navigation])

    const ScrollToTop = () => {
        
      };


    const onRefresh = () => {
        
        setRefresh(true)
    };
   const handleOnPressBtnNotify =() => {
        console.log('handleOnPressBtnNotify');
        // goToPage('NotifyScreen',{})
        
    }
    const [isShow, setShow] = useState<any>({
        fromDate: false,
        fromTime: false,
        toDate: false,
        toTime: false,
    });
    const getReportDate =async(date) =>{
        const _time_sheet_dailys = await _unitOfWork.user.getTimeSheetDaily({TimeSheetDate:date});
        settimesheetdates(_time_sheet_dailys.models);       
        selectFirst(_time_sheet_dailys.models)
    }
    const setChangeShow = (type, value) => {
        let _isShow = {...isShow};
        _isShow[type] = value;
        setShow(_isShow);
    };
   const selectFirst =(_timsheetdates) =>{
      setSelectId(1);
      if(_timsheetdates==null) _timsheetdates=[];
      if(_timsheetdates!=null){
       let _timsheetdate = _timsheetdates?.find(t=>t.shift ==0);  
       if(_timsheetdate==null)   _timsheetdate ={shift :0}
       if(_timsheetdate!=null && _timsheetdates!=null){ 
        if(_timsheetdate?.nv!=null && _timsheetdate.vm!=null)  _timsheetdate.sg=(_timsheetdate.nv - _timsheetdate.vm)*8       
        if(_timsheetdate.nv!=null && _timsheetdate.vm!=null && _timsheetdate.dm!=null && _timsheetdate.vs!=null && _timsheetdate.ot!=null) _timsheetdate.tsg = (_timsheetdate?.nv??0 - _timsheetdate?.vm??0)*8 - _timsheetdate.dm -_timsheetdate?.vs + _timsheetdate.ot    
        settimesheetdate(_timsheetdate);
     }    
    }   
   }
   const selectCa =(index:number) =>{   
    setSelectId(index);
    if(timsheetdates==null) settimesheetdates([]);
   
    if(timsheetdates!=null){
       
     let _timsheetdate = timsheetdates?.find(t=>t.shift ==(index-1));   
     if(_timsheetdate==null) {
        _timsheetdate ={shift :(index-1)}
        let list: Array<any> = [...timsheetdates];  
        list.push(_timsheetdate)
        settimesheetdate(_timsheetdate);
        settimesheetdates(list);       
     }  
     else{
        if(_timsheetdate.nv!=null && _timsheetdate.vm!=null)  _timsheetdate.sg=(_timsheetdate.nv - _timsheetdate.vm)*8 
        if(_timsheetdate.nv!=null && _timsheetdate.vm!=null && _timsheetdate.dm!=null && _timsheetdate.vs!=null && _timsheetdate.ot!=null) _timsheetdate.tsg = (_timsheetdate?.nv - _timsheetdate?.vm)*8 - _timsheetdate.dm -_timsheetdate?.vs + _timsheetdate.ot    
        settimesheetdate(_timsheetdate);
     }   
  }   
 }
   const saveReport =async() =>{
    let userId = await _unitOfWork.storage.getItem(StorageKey.ID) 
    let response = await _unitOfWork.user.saveTimeSheetDaily({userId:userId, models:timsheetdates, timeSheetDate:workDate });
    if (response.statusCode != 200) {
        Alert.alert("Thông báo", response.Message);

    } else {
           
            Alert.alert("Thông báo", "Đã cập nhật thành công");
    }
   }
   const changeValues =(item:any, type:string) =>{   
    settimesheetdate(item); 
    if(timsheetdates==null) settimesheetdates([])
    if(timsheetdates!=null){
      if(item.nv!=null && item.vm!=null) item.sg=(item.nv - item.vm)*8   
      if(item.nv!=null && item.vm!=null && item.dm!=null && item.vs!=null && item.ot!=null) item.tsg = (item.nv - item.vm)*8 - item.dm -item.vs + item.ot    
      let _timsheetdates = [...timsheetdates]
      let _timsheetdate = timsheetdates?.find(t=>t.shift ==item.shift);  
      if(_timsheetdate ==null){
        _timsheetdates.push(item)
      }else
      _timsheetdates?.forEach(t => {
          if(t.shift==item.shift) {            
            if(type=='ot') t.ot = item.ot;   
            if(type=='vm') t.vm = item.vm; 
            if(type=='dm') t.dm = item.dm;  
            if(type=='vs') t.vs = item.vs;  
            if(type=='gc') t.gc = item.gc;  
            if(type=='nv') t.nv = item.nv;    
            if(t.nv!=null && t.vm!=null) t.sg=(t.nv - t.vm)*8    
            if(t.nv!=null && t.vm!=null && t.dm!=null && t.vs!=null && t.ot!=null) t.tsg = (t.nv - t.vm)*8 - t.dm -t.vs + t.ot     
          }
      });
      settimesheetdates(_timsheetdates)  
  }   
 }
    const onSelectProduct =(item:any)=>{       
        setSelectedProductId(item.productId)
        let lotProduct =item.loProductionProcess
        setLotData(lotProduct);       
     }
     const searchProduct =(searchString:string) =>{        
         let _products= productsSearch.filter(p=>p.productName.toUpperCase().includes(searchString.toUpperCase()))
         setProducts(_products)        
     }
     function format(stringDate) {
        let inputDate = new Date(stringDate);
        let date, month, year;      
        date = inputDate.getDate();
        month = inputDate.getMonth() + 1;
        year = inputDate.getFullYear();
      
          date = date
              .toString()
              .padStart(2, '0');
      
          month = month
              .toString()
              .padStart(2, '0');
      
        return year<1972? '': `${date}/${month}/${year}`;
      }
    const [ columns, setColumns ] = useState([
        "Lot.No",
        "Ngày bắt đầu",
        "Ngày dự kiến hoàn thành"       
      ])
      const [ direction, setDirection ] = useState(null)
      const [ selectedColumn, setSelectedColumn ] = useState(null)
      const [ selectedProductId, setSelectedProductId ] = useState(null)
      const [ lotdata, setLotData ] = useState<Array<LotData>>([])       
      const [ products, setProducts ] = useState<Array<Product>>([])  
      const [timsheetdates,settimesheetdates]  = useState<Array<any>>([]);
      const [timsheetdate,settimesheetdate]  = useState<TimeSheetDaily>();
      const [ productsSearch, setProductsSearch ] = useState<Array<Product>>([])   

    const tableHeader = () => (
        <View style={styles.tableHeader}>
          <TouchableOpacity                    
                    style={styles.columnHeader} 
                    onPress={()=> {}}>
                    <Text style={styles.columnHeaderTxt}>Lot.No
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity                    
                    style={styles.columnHeader} 
                    onPress={()=> {}}>
                    <Text style={styles.columnHeaderTxt}>Ngày bắt đầu</Text>
                  </TouchableOpacity>
                  <TouchableOpacity                    
                    style={{justifyContent: "center", alignItems:"center"}} 
                    onPress={()=> {}}>
                    <Text style={styles.columnHeaderTxt}>Ngày dự kiến hoàn thành</Text>
                  </TouchableOpacity>
        </View>
      )
      const lotLoView =({item, index})=> {
        return (
        <View style={{...styles.tableRow, backgroundColor: "white"}}>
            <Text style={[styles.columnRowTxt,{color:'#080808', fontWeight:'700'}]}>{item.lotNoName}</Text>
            <Text style={styles.columnRowTxt}>{format(item.startDate)}</Text>
            <Text style={[styles.columnRowTxt,{marginLeft:40}]}>{format(item.endDate)}</Text>
            <TouchableOpacity 
                onPress={async(item) => {
                    console.log("lotdata[index]", lotdata[index]);
                    await _unitOfWork.storage.setItem(StorageKey.PRODUCTION_PROCESS_ID, lotdata[index].id)
                     navigation.navigate('LotDetailScreen',{'data':lotdata[index] });  
                }
            }>
                  <MaterialIcons name={'keyboard-arrow-right'} color= '#080808' size={32}/>
            </TouchableOpacity>                                
        </View>
        )
    };
      const lotLoRow = () => (
        <View style={styles.tableHeader}>
          <TouchableOpacity                    
                    style={styles.columnHeader} 
                    onPress={()=> {}}>
                    <Text style={styles.columnHeaderTxt}>Lot.No
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity                    
                    style={styles.columnHeader} 
                    onPress={()=> {}}>
                    <Text style={styles.columnHeaderTxt}>Ngày bắt đầu</Text>
                  </TouchableOpacity>
                  <TouchableOpacity                    
                    style={{justifyContent: "center", alignItems:"center"}} 
                    onPress={()=> {}}>
                    <Text style={styles.columnHeaderTxt}>Ngày dự kiến hoàn thành</Text>
                  </TouchableOpacity>
        </View>
      )
    const topComponent = () => {
        return (
            <View style={model_about_us ? {opacity: 0.5} : {}}>
                <Header onPressBtnNotify={handleOnPressBtnNotify} reloadHeader={reloadHeader} timeReload={timeReload}/>
                { isReport? 
                <View style={{flexDirection:'column', backgroundColor:'white'}}>
                    <View style={{height:60*heightRate, flexDirection:'row'}}>
                    <Text style ={{fontSize:fonsize+3, textAlignVertical:'center', marginHorizontal:20, fontWeight:'600'}}>Ngày thực hiện:</Text>
                        <TouchableOpacity style={styles.inputDate} onPress={()=>{setChangeShow('fromDate', true)}}>
                            <Text style={{fontSize:fonsize+3, marginRight:20, }}>{format(workDate)}</Text>
                            <Ionicons name={'calendar-outline'}  color="black" size={32*heightRate}/>
                        </TouchableOpacity>
                        <DatePicker
                                  mode="date"
                                  modal
                                  open={isShow?.fromDate}
                                  date={new Date()}
                                  onConfirm={(date) => {
                                    setChangeShow('fromDate', false,);
                                    setWorkDate(date);
                                    getReportDate(date);                                   
                                  }}
                                  
                                  onCancel={() => {
                                    setChangeShow('fromDate', false);
                                  }}
                              />
                        <TouchableOpacity  onPress={() => saveReport()}     style={styles.blueButton} >
                            <Text style={{fontSize:fonsize+2, color:'white'}}>Lưu</Text>
                     </TouchableOpacity>
                    </View>
                <View style={{height:layout.height-220*heightRate, flexDirection:'row', marginLeft:15, justifyContent:'flex-start'}}>  
                  
                         <View style={{ flex:1, justifyContent:'flex-start', flexDirection:'column', width: '25%', backgroundColor: "#F9F9F9" }} >
                        <ScrollView>                  
                            <View style= {[styles.caRow,{backgroundColor:'#9B9B9D'}]} >
                                <Text style={{textAlign:'left', fontSize:fonsize+3, fontWeight:'800', color:'white', paddingLeft:10}}>(1CORE)</Text>  
                            </View>                     
                        <TouchableOpacity onPress={()=>{selectCa(1)}}>
                            <View style= {[styles.caRow,{backgroundColor:selectId==1? '#169AF2':'#EFEFEF'}]} >
                                <Text style={{ color:selectId==1? 'white':'#333333', textAlign:'left', fontSize:fonsize+3, fontWeight:'600', paddingLeft:10}}>CA 1</Text>    
                                <Text style={{ color:selectId==1? 'white':'#333333',fontWeight:'400', fontSize:fonsize+2,   position:'absolute', bottom:10, right:10}}>{timsheetdates?.find(t=>t.shift==0)?.userName}</Text>                                                           
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{selectCa(2)}}>
                        <View style= {[styles.caRow,{backgroundColor:selectId==2? '#169AF2':'#EFEFEF'}]}  >
                                <Text style={{color:selectId==2? 'white':'#333333',textAlign:'left', fontSize:fonsize+3, fontWeight:'600', paddingLeft:10}}>CA 2</Text>    
                                <Text style={{color:selectId==2? 'white':'#333333',fontWeight:'400', fontSize:fonsize+1,   position:'absolute', bottom:10, right:10}}>{timsheetdates?.find(t=>t.shift==1)?.userName}</Text>                                                           
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{selectCa(3)}}>
                        <View style= {[styles.caRow,{backgroundColor:selectId==3? '#169AF2':'#EFEFEF'}]} >
                                <Text style={{color:selectId==3? 'white':'#333333',textAlign:'left', fontSize:fonsize+3, fontWeight:'600', paddingLeft:10}}>CA 3</Text>    
                                <Text style={{color:selectId==3? 'white':'#333333',fontWeight:'400', fontSize:fonsize+2,   position:'absolute', bottom:10, right:10}}>{timsheetdates?.find(t=>t.shift==2)?.userName}</Text>                                                           
                            </View>
                        </TouchableOpacity>

                        <View style= {[styles.caRow,{backgroundColor:'#9B9B9D'}]} >
                            <Text style={{textAlign:'left', fontSize:fonsize+3, fontWeight:'800', color:'white', paddingLeft:10}}>7 lsn (Visual)</Text>  
                        </View>                      
                        <TouchableOpacity onPress={()=>{selectCa(4)}}>
                        <View style= {[styles.caRow,{backgroundColor:selectId==4? '#169AF2':'#EFEFEF'}]} >
                                <Text style={{color:selectId==4? 'white':'#333333',textAlign:'left', fontSize:fonsize+3, fontWeight:'600', paddingLeft:10}}>CA 1</Text>    
                                <Text style={{ color:selectId==5? 'white':'#333333',fontWeight:'400', fontSize:22,   position:'absolute', bottom:10, right:10}}>{timsheetdates?.find(t=>t.shift==3)?.userName}</Text>                                                           
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{selectCa(5)}}>
                        <View style= {[styles.caRow,{backgroundColor:selectId==5? '#169AF2':'#EFEFEF'}]} >
                                <Text style={{color:selectId==5? 'white':'#333333',textAlign:'left', fontSize:fonsize+3, fontWeight:'600', paddingLeft:10}}>CA 2</Text>    
                                <Text style={{color:selectId==5? 'white':'#333333',fontWeight:'400', fontSize:22,   position:'absolute', bottom:10, right:10}}>{timsheetdates?.find(t=>t.shift==4)?.userName}</Text>                                                           
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{selectCa(6)}}>
                        <View style= {[styles.caRow,{backgroundColor:selectId==6? '#169AF2':'#EFEFEF'}]} >
                                <Text style={{color:selectId==6? 'white':'#333333',textAlign:'left', fontSize:fonsize+3, fontWeight:'600', paddingLeft:10}}>CA 3</Text>    
                                <Text style={{ color:selectId==5? 'white':'#333333',fontWeight:'400', fontSize:22,   position:'absolute', bottom:10, right:10}}>{timsheetdates?.find(t=>t.shift==5)?.userName}</Text>                                                           
                            </View>
                        </TouchableOpacity>
                        </ScrollView>
                         </View>
                        <View style={{ width: '75%', marginLeft:15, backgroundColor: "#F9F9F9", marginRight:15 }} >
                     <ScrollView>
                        <View style= {[styles.caRow]} >
                                <Text style={{textAlign:'left', fontSize:fonsize+3, fontWeight:'600', width: '50%', color:'black', paddingLeft:40}}>(1) Tổng số nhân sự</Text>  
                                <TextInput value={timsheetdate?.nv?.toString()} onChangeText ={(str)=>{ let _timsheetdate = {...timsheetdate} ; _timsheetdate.nv = Number(str); changeValues(_timsheetdate,"nv") }}   keyboardType='numeric' style={{fontSize:24, marginRight:20, textAlign:'center', marginLeft:10, width:'40%',height:55*heightRate, backgroundColor:'white', borderColor: 'gray', borderWidth:1.5}}></TextInput>
                         </View>
                         <View style= {[styles.caRow]} >
                                <Text style={{textAlign:'left', fontSize:fonsize+3, fontWeight:'600', width: '50%', color:'black', paddingLeft:40}}>(2) Vắng mặt</Text>  
                                <TextInput value={timsheetdate?.vm?.toString()} onChangeText ={(str)=>{ let _timsheetdate = {...timsheetdate} ; _timsheetdate.vm = Number(str); changeValues(_timsheetdate,"vm") }}    keyboardType='numeric' style={{fontSize:24, marginRight:20, textAlign:'center', marginLeft:10, width:'40%',height:55*heightRate, backgroundColor:'white', borderColor: 'gray', borderWidth:1.5}}></TextInput>
                         </View>
                         <View style= {[styles.caRow]} >
                                <Text style={{textAlign:'left', fontSize:fonsize+3, fontWeight:'600', width: '50%', color:'black', paddingLeft:40}}>(3) Số giờ làm việc = [(1)-(2)]*8</Text>  
                                <Text style={{width:400, textAlign:'center', fontSize:22, fontWeight:'500'}}>{timsheetdate?.sg ==null? '':timsheetdate?.sg?.toString()}</Text>
                         </View>
                         <View style= {[styles.caRow]} >
                                <Text style={{textAlign:'left', fontSize:fonsize+3, fontWeight:'600', width: '50%', color:'black', paddingLeft:40}}>(4) Đi muộn</Text>  
                                <TextInput value={timsheetdate?.dm?.toString()} onChangeText ={(str)=>{ let _timsheetdate = {...timsheetdate} ; _timsheetdate.dm = Number(str); changeValues(_timsheetdate,"dm") }}  keyboardType='numeric' style={{fontSize:24, marginRight:20, textAlign:'center', marginLeft:10, width:'40%',height:55*heightRate, backgroundColor:'white', borderColor: 'gray', borderWidth:1.5}}></TextInput>
                         </View>
                         <View style= {[styles.caRow]} >
                                <Text style={{textAlign:'left', fontSize:fonsize+3, fontWeight:'600', width: '50%', color:'black', paddingLeft:40}}>(5) Về sớm</Text>  
                                <TextInput value={timsheetdate?.vs?.toString()} onChangeText ={(str)=>{ let _timsheetdate = {...timsheetdate} ; _timsheetdate.vs = Number(str); changeValues(_timsheetdate,"vs") }}    keyboardType='numeric' style={{fontSize:24, marginRight:20, textAlign:'center', marginLeft:10, width:'40%',height:55*heightRate, backgroundColor:'white', borderColor: 'gray', borderWidth:1.5}}></TextInput>
                         </View>
                         <View style= {[styles.caRow]} >
                                <Text style={{textAlign:'left', fontSize:fonsize+3, fontWeight:'600', width: '50%', color:'black', paddingLeft:40}}>(6) OT</Text>  
                                <TextInput value={timsheetdate?.ot?.toString()} onChangeText ={(str)=>{ let _timsheetdate = {...timsheetdate} ; _timsheetdate.ot = Number(str); changeValues(_timsheetdate,"ot") }}    keyboardType='numeric' style={{fontSize:24, marginRight:20, textAlign:'center', marginLeft:10, width:'40%',height:55*heightRate, backgroundColor:'white', borderColor: 'gray', borderWidth:1.5}}></TextInput>
                         </View>
                         <View style= {[styles.caRow]} >
                                <Text style={{textAlign:'left', fontSize:fonsize+3, fontWeight:'600', width: '50%', color:'black', paddingLeft:40}}>(7) Tổng số giờ làm việc = (3)-(4)-(5)+(6)</Text>  
                                <Text style={{width:400, textAlign:'center', fontSize:fonsize+2, fontWeight:'500'}}>{timsheetdate?.tsg ==null? '':timsheetdate?.tsg?.toString()}</Text>
                         </View>
                         <View style= {[styles.caRow,{height:120*heightRate}]} >
                                <Text style={{textAlign:'left', fontSize:fonsize+3, fontWeight:'600', width: '50%', color:'black', paddingLeft:40}}>(8) Ghi chú</Text>  
                                <TextInput  multiline value={timsheetdate?.gc?.toString()} onChangeText ={(str)=>{ let _timsheetdate = {...timsheetdate} ; _timsheetdate.gc = str; changeValues(_timsheetdate,"gc") }}  style={{fontSize:fonsize+2,  marginRight:20, width:'40%',height:100, backgroundColor:'white', borderColor: 'gray', borderWidth:1.5}}></TextInput>
                         </View>
                         </ScrollView>
                        </View>      
                        
                </View>
                </View>
                :
                <View style={{ height:layout.height-160*heightRate,flex:1, justifyContent:'flex-start', flexDirection:'row', backgroundColor: "#FFFFFF" }} >
                     <View style={{ flex:1, justifyContent:'flex-start', flexDirection:'column', width: '25%', height: layout.height, backgroundColor: "#F9F9F9" }} >
                              <Text style ={styles.textTitle}>Sản phẩm đang sản xuất</Text>
                            <View style={[styles.inputSection, { minHeight: 48*heightRate, borderColor:'gray' }]}>                           
                                <TextInput style={{...styles.input, marginHorizontal:10}} placeholder="Tên sản phẩm" editable={true} onChangeText={(searchString) => {searchProduct(searchString)
                                }} underlineColorAndroid="transparent"/>
                                <Ionicons name={'search'} size={32*heightRate} color='#080808' style={styles.inputStartIcon}/>    
                            </View>

                     {/* <FlatList 
                        data={products}
                        style={{justifyContent:'center', margin:20 }}
                        keyExtractor={(item, index) => index+""}                       
                        stickyHeaderIndices={[0]}
                        renderItem={({item, index})=> {
                            return (
                         <TouchableOpacity onPress={()=>{onSelectProduct(item)}}>
                            <View style= {item.productId ===  selectedProductId ? styles.productSelected : styles.productRow} >
                                <Text style={item.productId ===  selectedProductId ? styles.productNameSelected : styles.productName}>{item.productName}</Text>    
                                <Text style={item.productId ===   selectedProductId? styles.lotNameSelected : styles.lotName}>{item.loCount} Lô</Text>                                                           
                            </View>
                        </TouchableOpacity>
                            )
                        }}
                        />       */}
                        <View style ={{margin:10,marginBottom:200*heightRate}}>
                        <ScrollView>
                         {products.map((item, index) => {
                                return (
                                    <TouchableOpacity onPress={()=>{onSelectProduct(item)}}>
                                    <View style= {item.productId ===  selectedProductId ? styles.productSelected : styles.productRow} >
                                        <Text style={item.productId ===  selectedProductId ? styles.productNameSelected : styles.productName}>{item.productName}</Text>    
                                        <Text style={item.productId ===   selectedProductId? styles.lotNameSelected : styles.lotName}>{item.loCount} Lô</Text>                                                           
                                    </View>
                                </TouchableOpacity>
                                );
                              })}
                        </ScrollView>
                        </View>
                    </View>
                <View style={{ width: '75%', height: layout.height-150*heightRate, marginLeft:15, backgroundColor: "#F9F9F9" }} >
                   
                    <Text style ={styles.textTitle}>Lô đang sản xuất</Text>    
                            <TouchableOpacity onPress={()=>{setRefresh(true)}} style={{...styles.blueButton, backgroundColor :"#169BD5",position:'absolute', top:5*heightRate,}}>
                                    <View style={{justifyContent:'center',flexDirection:'row'}}>
                                        <FontAwesome
                                        name={'refresh'}
                                        size={28*heightRate}
                                        color="white"
                                        style={{}}
                                        />
                                        <Text style={{fontSize:fonsize+1, color:'white', marginLeft:10}}>Tải lại</Text> 
                                        </View>
                                </TouchableOpacity>              
                  <ScrollView>
                   <FlatList 
                        data={lotdata}
                        style={{justifyContent:'center', marginVertical:10,marginHorizontal:20 }}
                        keyExtractor={(item, index) => index+""}
                        ListHeaderComponent={tableHeader}
                        stickyHeaderIndices={[0]}
                        renderItem={lotLoView}
                        />
                  </ScrollView>
                </View>                    
                </View>}
            </View>
            
        );
    };
    const FooterComponent = () => {
        return (
            <View style={{height:60*heightRate, flexDirection:'row',width:'100%'}}>
                    <TouchableOpacity style={{backgroundColor :isReport?'#E6E6E6':'#807B7B',height:60*heightRate,width:'50%'}} onPress ={()=>{setIsReport(false)}}>
                        <Text style={{width:'100%',textAlign:'center',height:60*heightRate,textAlignVertical:'center', fontSize:fonsize+3, fontWeight:'700'}}>Cập nhật sản xuất</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{backgroundColor :isReport?'#807B7B':'#E6E6E6',height:60*heightRate,width:'50%'}}onPress ={()=>{setIsReport(true)}}>
                    <Text style={{width:'100%',textAlign:'center',height:60*heightRate,textAlignVertical:'center', fontSize:fonsize+3, fontWeight:'700'}}>Báo cáo nhân sự</Text>
                    </TouchableOpacity>                  
            </View>
        )
    }
    return (
        <>
            {isLoading && <CenterSpinner/>}
            <Screen style={ROOT} preset="fixed">
                <View style={{flex: 1}}>
                    <FlatList
                        ref={flatListRef}
                        //refreshing={isRefresh}
                        // onRefresh={() => onRefresh()}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{flex: 1}}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        ListFooterComponent={FooterComponent()}
                        keyExtractor={(item, index) => 'dashboard-' + index + String(item)}
                    />
                </View>               
            </Screen>

        </>
    );
});

const styles = StyleSheet.create({
  
    linearGradient: {
        height: 104,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 5
    },
    inputSection: {
        flex: 1,
        alignSelf: "center",
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderRadius: 10,
        borderColor: color.primary,
        minHeight: 40*heightRate,
        maxHeight: 40*heightRate,
        margin:10
    },
    input: {
        flex: 1,
        fontSize: fonsize,
        paddingTop: 10*heightRate,
        paddingRight: 10,
        paddingBottom: 10*heightRate,
        paddingLeft: 0,
        backgroundColor: '#fff',
        color: '#424242',
    },
    inputDate: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginRight: 8,
        borderWidth: 1,
        borderColor: color.black,
        backgroundColor:'white',
        // paddingHorizontal: 12,
        paddingLeft: 16,
        marginLeft:10,
        height:50*heightRate,
        marginTop:4,
        paddingRight: 8,
        paddingVertical: 6*heightRate,
        borderRadius: 4,
    },
    blueButton: {
        height: 45*heightRate,
        width: 90,
        backgroundColor:'#169AF2',
        marginLeft: '5%',
        borderRadius: 8,
        marginTop:3,
        justifyContent: 'center',
        alignItems: 'center',
        position:'absolute',
        right: 20
    },
    inputStartIcon: {
        width: 32,
        height: 32*heightRate,
        // resizeMode: "contain",
        marginHorizontal: 15,
        marginVertical: 10,
        // color: "#9098B1",
    },
        buttonText: {
        fontSize: 18,
        // fontFamily: 'Gill Sans',
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
        backgroundColor: 'transparent',
    },
    text: {
        // fontFamily: 'Lato',
    },
    textTitle:{
       fontSize: fonsize+4  ,
       paddingVertical:10*heightRate,
       fontWeight: '500',
       textAlign:'center',
       color: color.black,
       height: 60*heightRate,
       alignItems:'center',
       backgroundColor: '#F2F2F2'
    },
    Text_1 : {
        color: color.white,
        // fontFamily: 'Lato',
        fontWeight: '400',
        fontSize: 16,
        marginTop: 15,
    },
    btn_1: {
        marginTop: 15,
        height: 40,
        backgroundColor: color.white,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15
    },
    category: {
        height: 100,
    },
    news: {
        height: 191,
        marginBottom: 16
    },
    item_category: {
        marginTop: 15,
        width: 70,
        height: 70,
        backgroundColor: color.white,
        borderRadius: 10,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    item_view : {
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: color.white,
        marginBottom: 16,
        // height: 120,
        borderRadius: 10,
        width: layout.width - 32
    },
    image_item: {
        width: 50,
        height: 50
    },
    item_new: {
        height: 191,
        width: layout.width,
        marginRight: 10,
    },
    about_us: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: color.lightGrey,
        borderBottomWidth: 1,
        borderTopColor: color.lightGrey,
        borderTopWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 15,
        paddingVertical: 15
    },
    text_footer: {
        marginBottom: 15, 
        fontSize: 14, 
        fontWeight: '400',
        color: 'black'
    },
    modal_container: {
        backgroundColor: color.white, 
        width: layout.width - 30,
        height: layout.height/10 * 8,
        minHeight: 550,
        marginTop: layout.height/20,
        marginLeft: 15,
        borderRadius: 20

    },
    text_header: {
        fontWeight: '700',
        // fontFamily: 'Lato',
        fontSize: 16,
        color: color.xanh_xam

    },
    text_item_job: {
        marginTop: 6, 
        width: layout.width - 130,
        color: color.text_naunhat
    },
        container: {
          flex: 1,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop:80
        },
        tableHeader: {
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          backgroundColor: "#E6E6E6",
          borderTopEndRadius: 10,
          borderTopStartRadius: 10,
          height:  60*heightRate,
        },
        tableRow: {
          flexDirection: "row",
          height: 60*heightRate,
          alignItems:"center",
          borderColor: color.lightGrey,
          borderWidth: 2,
          marginBottom: 5,
          borderRadius:10
        },
        productRow: {
            flexDirection: "row",
            height:  60*heightRate,
            alignItems:"center",
            backgroundColor: "white",
            borderColor: color.lightGrey,
            borderWidth: 2,
            marginBottom: 10,
            marginHorizontal:6,
            borderRadius:10
          },
          caRow: {
            flexDirection: "row",
            height: 70*heightRate,
            alignItems:"center",
            backgroundColor: "#EFEFEF",
            borderColor: color.lightGrey,
            borderBottomWidth: 1,  
          },
          productSelected: {
            flexDirection: "row",
            height: 60*heightRate,
            alignItems:"center",
            backgroundColor: "#0B7EE5",
            borderColor: color.lightGrey,
            borderWidth: 2,
            marginBottom: 10,    
            marginHorizontal:6,       
            borderRadius:10
          },
        columnHeader: {
          width: "20%",         
          justifyContent: "center",
          alignItems:"center"
        },
        columnHeaderTxt: {
          color: "#333333",         
          fontSize: fonsize+3  ,      
          fontWeight: '700',    
        },
        columnRowTxt: {
          width:"30%",
          textAlign:"center",
          fontSize:fonsize+3  ,
          fontWeight:'500'
        },
        productName: {      
            width:"100%",      
            textAlign:"center",           
            fontWeight:'500',
            color:'#333333'
            ,fontSize:fonsize+3         
          },
          productNameSelected: {      
            width:"100%",      
            textAlign:"center",           
            fontWeight:'500',
            color:'white'
            ,fontSize:fonsize+3           
          },
    lotName:{
         color:'#5D7CEF',        
         fontSize:fonsize-2  ,
         position:'absolute',
         bottom:10,
          right:5
        },
      lotNameSelected:{color:'white',
          fontWeight:'500',
          fontSize:fonsize-2 ,
          position:'absolute',
          bottom:10*heightRate,
           right:5},
});
