import React, {useCallback, useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
  Animated,
  Dimensions,
  PixelRatio,
  FlatList,
  StyleSheet,
  View,
  ViewStyle,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {Screen} from '../../components';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import CenterSpinner from "../../components/center-spinner/center-spinner";
import {color} from '../../theme';
import {
  TabView,
  SceneMap,
  TabBar,
  TabBarIndicator,
} from 'react-native-tab-view';
import {Header} from '../../components/header/header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {images} from '../../images';
import {model, number, string} from 'mobx-state-tree/dist/internal';
import CheckBox from '@react-native-community/checkbox';
import {UnitOfWorkService} from '../../services/api/unitOfWork-service';
import SelectDropdown from 'react-native-select-dropdown';
import {StorageKey, Storage} from '../../services/storage/index';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {propagateChangeConfirmed} from 'mobx/dist/internal';

const layout = Dimensions.get('window');
const heightRate = layout.height / 844;
const widthRate = layout.width / 1280;
const ROOT: ViewStyle = {
  flex: 1,
};
//const fonsize = Math.round(PixelRatio.roundToNearestPixel(20)) - 2;
const fonsize = (layout.height * 20) / 844;
type LotData = {
  productId: number;
  lotId: number;
  productCode: string;
  lotNoName: string;
  customerName: string;
  quantityReached: number;
  statusName: string;
  startDate: Date;
  endDate: Date;
  processStageModel: Array<any>;
};
type ProductionProcessStage = {
  id: string;
  stageNameId: string;
  stageName: string;
  startDate: Date;
  totalReached: number;
  totalNotReached: number;
  statusName: string;
  statusId: string;
  statusCode: string;
  selectImplementationDate: Array<any>;
  fromTime: number;
};
function getTime(inputDate: Date) {
  let hours, mins;
  if (inputDate == null) return '';
  hours = inputDate.getHours();
  mins = inputDate.getMinutes();

  return `${hours}:${mins}`;
}
function format(stringDate) {
  let inputDate = new Date(stringDate);
  let date, month, year;
  date = inputDate.getDate();
  month = inputDate.getMonth() + 1;
  year = inputDate.getFullYear();

  date = date.toString().padStart(2, '0');

  month = month.toString().padStart(2, '0');

  return year < 1972 ? '' : `${date}/${month}/${year}`;
}
export const LotDetailScreen = observer(function LotDetailScreen(props: any) {
  const {data} = props.route.params;
  const [isRefresh, setRefresh] = useState(false);
  const {params}: any = useRoute();
  const isFocus = useIsFocused();
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    // const unsubscribe = navigation.addListener('focus', () => {
    //   // The screen is focused
    //   // Call any action and update data
    //   Alert.alert('OK')
    // });
    fetchData();
  }, [isRefresh, isFocus]);
  const _unitOfWork = new UnitOfWorkService();
  const fetchData = async () => {
    console.log('params', params);
    setLoading(true);
    setRefresh(false);
    if (!isRefresh) {
      
      let _full_name = await _unitOfWork.storage.getItem(StorageKey.FULL_NAME);
      let _user_avatar = await _unitOfWork.storage.getItem(
        StorageKey.USER_AVATAR,
      );
      
      setFullName(_full_name);
      setUserAvatar(_user_avatar);
      setLotData({});
      setProcessStageTabList([]);
      let userId = await _unitOfWork.storage.getItem(StorageKey.ID);
      let productionProcessId = await _unitOfWork.storage.getItem(
        StorageKey.PRODUCTION_PROCESS_ID,
      );
      
      let producttionProcesData =
        await _unitOfWork.user.getProductionProcessDetailByIdAndUserId({
          ProductionProcessDetailId: productionProcessId,
          userId: userId,
        });
        // Alert.alert('23');
        // console.log({Data11:producttionProcesData});
        // return;
      setLotData(producttionProcesData.model);
      let stageGroups = new Array<any>();     
      producttionProcesData.model.processStageModels.forEach(stage => {
        if (!stageGroups.some(p => p.stageGroupId == stage.stageGroupId))
          stageGroups.push({
            stageGroupId: stage.stageGroupId,
            stageGroupName: stage.stageGroupName,
            userId: userId,
          });
      });
      await setRoutes(stageGroups);
      if (stageGroups.length > 0) {
        setbuttonIdSelected(stageGroups[0].stageGroupId);
        setProcessStageTabList(
          producttionProcesData.model.processStageModels.filter(
            p => p.stageGroupId == stageGroups[0].stageGroupId,
          ),
        );
        //SelectButtonStage(stageGroups[0])
      }
    
      // const _warehouse = await _unitOfWork.user.searchWareHouse({});
      const _warehouse = await _unitOfWork.user.getListWareHouse({
        warehouseType: 3, organizationId:producttionProcesData.model?.departmentId
      });
      const _productWarehouse = await _unitOfWork.user.getListWareHouse({
        warehouseType: 4, organizationId:producttionProcesData.model?.departmentId
      });
      //  const _productInput = await _unitOfWork.user.getProductInputByProductionProcessStageId({productionProcessStageId: 10, warehouseId:"651160f4-edd7-4e3f-a3a6-de3577035108"});
      //  setMaterial(_productInput.models)
      setWarehouses(_warehouse.listWareHouse);
      if (_warehouse.listWareHouse.length > 0)
        setwarehouse(_warehouse.listWareHouse[0]);
        
         if(_productWarehouse.listWareHouse.length>0) setProductwarehouse(_productWarehouse.listWareHouse[0])
      setwarehouseNames(_warehouse.listWareHouse.map(w => w.warehouseName));
      setProductWarehouses(_productWarehouse.listWareHouse);
      setProductWarehouseNames(
        _productWarehouse.listWareHouse.map(w => w.warehouseName),
      );
      const _categories = await _unitOfWork.user.getAllCategory({});
      const categories = _categories.categoryTypeList.filter(
        c =>
          c.categoryTypeId.toUpperCase() ==
          'E87C2066-8AF4-4C16-8498-08B8AA256B24',
      );
      setStatusList(categories[0].categoryList);
      let _statusList = categories[0].categoryList.map(c => c.categoryName);
      _statusList.unshift('Tất cả');
      setStatusListName(_statusList);
      setLoading(false);
    }
  };

  const [full_name, setFullName] = useState('');
  const [user_avatar, setUserAvatar] = useState('');
  const [lotdata, setLotData] = useState({});
  const [statusList, setStatusList] = useState<Array<any>>([]);
  const [statusListName, setStatusListName] = useState<Array<any>>([]);
  const [warehouses, setWarehouses] = useState<Array<any>>([]);
  const [warehouseNames, setwarehouseNames] = useState<Array<any>>([]);
  const [warehouse, setwarehouse] = useState();
  const [productWarehouse, setProductwarehouse] = useState();
  const [productWarehouseNames, setProductWarehouseNames] = useState<
    Array<any>
  >([]);
  const [productWarehouses, setProductWarehouses] = useState<Array<any>>([]);
  const [modalMaterialVisible, setModalMaterialVisible] = useState(false);
  const [stageId, setStageId] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [stageSelected, setStageSelected] = useState({});
  const [modaConfirmlVisible, setConfirmModalVisible] = useState(false);
  const [processStageTabList, setProcessStageTabList] = useState<
    Array<ProductionProcessStage>
  >([]);
  const [processStageError, setProcessStageError] = useState();
  const getMaterials = async (index:number) => {
    setLoading(true);
    const _productInput =
      await _unitOfWork.user.getProductInputByProductionProcessStageId({
        productionProcessStageId: stageId,
        warehouseId: warehouses[index]?.warehouseId,
      });
    setMaterial(_productInput.models);
    setLoading(false);
    // console.log({
    //   Kho: _productInput.models,
    //   warehouseId: warehouse?.warehouseId,
    // });
  };
  const [buttonIdSelected, setbuttonIdSelected] = useState('');
  const tableHeader = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#E6E6E6',
        borderColor: 'black',
        borderWidth: 1,
        height: 50 * heightRate,
      }}>
      <View
        style={{
          height: '100%',
          width: '25%',
          borderRightColor: 'black',
          borderRightWidth: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Công đoạn</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: '17%',
          borderRightColor: 'black',
          borderRightWidth: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Ngày thực hiện</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: '15%',
          borderRightColor: 'black',
          borderRightWidth: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Trạng thái</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: '13%',
          borderRightColor: 'black',
          borderRightWidth: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Số lượng đạt</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: '13%',
          borderRightColor: 'black',
          borderRightWidth: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}> NG</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: '17%',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Xác nhận</Text>
      </View>
    </View>
  );

  const searchStage = (searchString: string) => {
    let _processStageTabList = lotdata?.processStageModels.filter(p =>
      p.stageName.toUpperCase().includes(searchString.toUpperCase()),
    );
    setProcessStageTabList(_processStageTabList);
  };
  const WhiteButton = props => {
    switch (props?.item.statusCode) {
      case 'TTCDHT':
        return (
          <TouchableOpacity
            style={styles.whiteButton}
            onPress={() => {
              checkConfirmStage(props?.item);
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Ionicons
                name={'checkbox'}
                size={fonsize * 1.5}
                color="#4517E9"
                style={styles.inputStartIcon}
              />
              <Text style={{fontSize: fonsize, color: 'black'}}>Xác nhận</Text>
            </View>
          </TouchableOpacity>
        );
      case 'TTCDDTH':
        return (
          <TouchableOpacity
            style={styles.whiteButton}
            onPress={() => {
              checkCompleteStage(props?.item);
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <MaterialIcons
                name="radio-button-checked"
                size={fonsize * 1.5}
                color="#08E81D"
              />
              <Text style={{fontSize: fonsize, color: 'black'}}>
                Hoàn thành
              </Text>
            </View>
          </TouchableOpacity>
        );
      case 'TTCDCBD':
        return (
          <TouchableOpacity
            style={styles.whiteButton}
            onPress={() => {
              startStage(props?.item, props?.index);
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Ionicons
                name={'play'}
                size={fonsize * 1.5}
                color="#046EF6"
                style={styles.inputStartIcon}
              />
              <Text style={{fontSize: fonsize, color: 'black'}}>Bắt đầu</Text>
            </View>
          </TouchableOpacity>
        );
      default:
        return <Text></Text>;
    }
  };
  const StatusText = props => {
    switch (props?.item.statusCode) {
      case 'TTCDHT': //N'Hoàn thành'
        return (
          <Text style={[styles.columnRowTxt, {color: '#08E81D'}]}>
            {props?.item?.statusName}
          </Text>
        );
      case 'TTCDDXN': //N'Hoàn thành'
        return (
          <Text style={[styles.columnRowTxt, {color: '#4517E9'}]}>
            {props?.item?.statusName}
          </Text>
        );
      case 'TTCDDTH': //Đang thực hiện
        return (
          <Text
            style={[
              styles.columnRowTxt,
              {color: props?.item.alert ? 'white' : 'black'},
            ]}>
            {props?.item?.statusName}
          </Text>
        );
      case 'TTCDCBD': //N'Chưa bắt đầu'
        return (
          <Text style={[styles.columnRowTxt, {color: 'black'}]}>
            {props?.item?.statusName}
          </Text>
        );
      default:
        return (
          <Text style={[styles.columnRowTxt, {color: 'black'}]}>
            {props?.item?.statusName}
          </Text>
        );
    }
  };
  const renderItemGrid = ({item, index}) => {
    return (
      <View
        style={{
          ...styles.tableRow,
          backgroundColor: item.alert ? 'red' : 'white',height: item.selectImplementationDate?.length>1? (50 * layout.height*item.selectImplementationDate?.length*0.7) / 844: (50 * layout.height) / 844
        }}>
        <View
          style={{
            height: '100%',
            width: '25%',
            borderRightColor: color.lightGrey,
            borderRightWidth: 2,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            onPress={() => {
              let maxSortOrder = Math.max(
                ...processStageTabList.map(o => o.sortOrder),
              );
              navigation.navigate('PhaseDetailScreen', {
                stageDetailData: item,
                statusList: statusList,
                maxSortOrder: maxSortOrder,
                previousData: {
                  statusCode:
                    index == 0 ? '' : processStageTabList[index - 1].statusCode,
                  stageName:
                    index == 0 ? '' : processStageTabList[index - 1].stageName,
                },
              });
            }}>
            <Text
              style={[
                styles.columnRowStage,
                {paddingLeft: 5, color: item.alert ? 'white' : '#0579DF'},
              ]}>
              {item?.stageName}
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            height: '100%',
            width: '17%',
            borderRightColor: 'black',
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <Text
            style={[
              styles.columnRowTxt,
              {color: item.alert ? 'white' : '#333'},
            ]}>
            {item?.selectImplementationDate?.sort((m1, m2) =>
                      m1 > m2 ? 1 : -1,
                    ).map(d=>format(d)).join(" ; ")}
          </Text>
        </View>
        <View
          style={{
            height: '100%',
            width: '15%',
            borderRightColor: 'black',
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <StatusText item={item}></StatusText>
        </View>
        <View
          style={{
            height: '100%',
            width: '13%',
            borderRightColor: 'black',
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          {item?.totalReached == null ? (
            <Text></Text>
          ) : (
            <Text
              style={[
                styles.columnRowTxt,
                {color: item.alert ? 'white' : '#333'},
              ]}>
              {item?.totalReached}/{item?.totalProduction}
            </Text>
          )}
        </View>
        <View
          style={{
            height: '100%',
            width: '13%',
            borderRightColor: 'black',
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          {item?.totalProduction > item?.totalReached &&
          (item.statusCode == 'TTCDDXN' || item.statusCode == 'TTCDHT') ? (
            <TouchableOpacity onPress={() => ProcessStageErrorPress(item)}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: fonsize,
                  color: '#0579DF',
                }}>
                Chi tiết
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.columnRowCenterTxt}>
              {item?.totalReached == 0 ? '' : 0}
            </Text>
          )}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center', flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              width: 400,
              justifyContent: 'center',
            }}>
            <WhiteButton item={item} index={index}></WhiteButton>
          </View>
        </View>
      </View>
    );
  };

  const ConfirmMaterial = async () => {
    setLoading(true);
    materials.forEach(m => (m.warehouseId = warehouse.warehouseId));
    let userId = await _unitOfWork.storage.getItem(StorageKey.ID);
    const response =
      await _unitOfWork.user.confirmProductInputByProductionProcessStageId({
        models: materials,
        userId: userId,
        selectImplementationDate:stageDetails.selectImplementationDate??[],
        productionProcessStageId: stageId,
        WarehouseId: warehouse.warehouseId,
      });
    console.log({
      models: materials,
      userId: userId,
      productionProcessStageId: stageId,
      WarehouseId: warehouse.warehouseId,
    });
    if (response.statusCode != 200) {
      Alert.alert('Thông báo', response.messageCode);
    } else {
      let list: Array<ProductionProcessStage> = [...processStageTabList];
      list.forEach(stage => {
        if (stage.id == stageId) {
          stage.statusCode = 'TTCDDTH';
          stage.selectImplementationDate = [new Date()];
          stage.fromTime = new Date().getTime();
          let statusItems = statusList.filter(s => s.categoryCode == 'TTCDDTH');
          if (statusItems.length > 0) {
            console.log({Cate: statusItems});
            stage.statusName = statusItems[0].categoryName;
          } else {
          }
        }
      });
      setProcessStageTabList(list);
      Alert.alert('Thông báo', 'Đã lưu thành công');
      setModalMaterialVisible(false);
    }
    setLoading(false);
  };
  const ProcessStageErrorPress = async item => {
    setProcessStageError(item);
    setFailPhases(item.processErrorStageModels);
    setModalVisible(!modalVisible);
  };

  const SelectButtonStage = async item => {
    setbuttonIdSelected(item.stageGroupId);
    setProcessStageTabList(
      lotdata?.processStageModels.filter(
        p => p.stageGroupId == item.stageGroupId,
      ),
    );
  };
  const startStage = async (item, index) => {
    if (index > 0 && processStageTabList[index - 1].statusCode != 'TTCDDXN') {
      Alert.alert(
        'Bạn cần hoàn thành công đoạn ' +
          processStageTabList[index - 1].stageName +
          ' trước khi thực hiện công đoạn này.',
      );
      return;
    }
    //console.log({Statage: item})
    if (!item.isStageWithoutProduct) {
      setLoading(true);
      const _productInput =
        await _unitOfWork.user.getProductInputByProductionProcessStageId({
          productionProcessStageId: item.id,
          warehouseId: warehouses.length>0? warehouses[0].warehouseId:null,
        });
      setMaterial(_productInput.models);
      setModalMaterialVisible(!modalMaterialVisible);
      setStageId(item.id);
      setLoading(false);
    } else {
      let str =
        'Bạn chắc chắn muốn bắt đầu thực hiện công đoạn ' + item.stageName;
      Alert.alert(
        'Xác nhận bắt đầu công đoạn',
        str,
        [
          {
            text: 'Hủy bỏ',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Đồng ý',
            onPress: async () => {
              setLoading(true);
              let userId = await _unitOfWork.storage.getItem(StorageKey.ID);
              console.log({Stage: item});
              const response =
                await _unitOfWork.user.confirmProductInputByProductionProcessStageId(
                  {
                    UserId: userId,
                    productionProcessStageId: item.id,
                    selectImplementationDate:item.selectImplementationDate??[],
                    WarehouseId: warehouse.warehouseId,
                  },
                );
              //const response = await _unitOfWork.user.confirmProductionProcessStageById({UserId:userId,productionProcessStageId: item.id, WarehouseId: warehouse.warehouseId});
              if (response.statusCode != 200) {
                Alert.alert('Thông báo', response.messageCode);
              } else {
                let list: Array<ProductionProcessStage> = [
                  ...processStageTabList,
                ];
                list.forEach(stage => {
                  if (stage.stageNameId == item.stageNameId) {
                    stage.statusCode = 'TTCDDTH';
                    stage.selectImplementationDate = [new Date()];
                    stage.fromTime = new Date().getTime();
                    let statusItems = statusList.filter(
                      s => s.categoryCode == 'TTCDDTH',
                    );
                    if (statusItems.length > 0) {
                      console.log({Cate: statusItems});
                      stage.statusName = statusItems[0].categoryName;
                    } else {
                    }
                  }
                });
                setProcessStageTabList(list);
                // processStageTabList.forEach(m=>{if(m.stageNameId==item.stageNameId)
                //   m.stageNameId ==
                // });
                Alert.alert('Thông báo', 'Đã cập nhật thành công');
                setRefresh(true);
                setLoading(false);
              }
            },
          },
        ],
        {cancelable: false},
      );
    }
  };
  const checkCompleteStage = async item => {

    let isValid = true;
    if(item.selectImplementationDate ==null || item.selectImplementationDate?.length==0) isValid = false;
    
    if(item.selectStartPerformerId ==null || item.selectStartPerformerId?.length==0){
      isValid = false;
    }     
    if((item.selectEndPerformerId==null || item.selectEndPerformerId?.length==0) && item.numberPeople>1) isValid = false;
   
    if(item.totalReached==null) isValid = false;    
    item.processStageDetails?.forEach(stage => {    
        let processStageDetailValues = stage.processStageDetailValueModels;
        processStageDetailValues.forEach(valueModel => {
          if (valueModel.value == null || valueModel.value == "") {
            if(stage?.specificationsStageName?.trim()!="Thời gian kết thúc") {
              isValid = false;
            }
          }
        });     
    });   
    if(!isValid){
      Alert.alert('Thông báo', "Bạn cần nhập dữ liệu cho tất cả các hạng mục cần kiểm tra trước khi hoàn thành công đoạn");
      return;
    }   

    let str = 'Bạn chắc chắn muốn hoàn thành công đoạn ' + item.stageName;
    Alert.alert(
      'Xác nhận hoàn thành',
      str,
      [
        {
          text: 'Hủy bỏ',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Đồng ý',
          onPress: async () => {
            setLoading(true);
            let userId = await _unitOfWork.storage.getItem(StorageKey.ID);
            let _model = {...item};
            _model.statusId = '9D886B64-DD08-4E31-9683-9BC22AF00549';
            _model.selectEndPerformerId = [];
            _model.processStageDetailModels = [];
            _model.processErrorStageModels = [];
            _model.processListNgModels = [];
            _model.personInChargeModels = [];
            _model.personInChargeId = [];
            _model.selectImplementationDate = [];
            _model.selectStartPerformerId = [];
            _model.selectEndPerformerId = [];
            _model.fromTime = 0;
            _model.processStageDetailModels.forEach(stage => { 
              if(stage?.specificationsStageName?.trim()=="Thời gian kết thúc") {
               let processStageDetailValues = stage.processStageDetailValueModels; 
               processStageDetailValues.forEach(valueModel => {
                 if (valueModel.value == null || valueModel.value == "") { valueModel.value = getTime(new Date());
               }
             });
             }                  
             });
            console.log({Item: item, Model: _model});
            const response = await _unitOfWork.user.saveProductionProcessStage({
              model: _model,
            });
            setLoading(false);
            if (response.statusCode != 200) {
              Alert.alert('Thông báo', response.messageCode);
            } else {
              let list: Array<ProductionProcessStage> = [
                ...processStageTabList,
              ];
              list.forEach(stage => {
                if (stage.stageNameId == item.stageNameId) {
                  stage.statusCode = 'TTCDHT';

                  let statusItems = statusList.filter(
                    s => s.categoryCode == 'TTCDHT',
                  );
                  if (statusItems.length > 0) {
                    stage.statusName = statusItems[0].categoryName;
                    // stage.statusId = statusItems[0].categoryId
                  } else {
                  }
                }
              });
              setProcessStageTabList(list);
              // processStageTabList.forEach(m=>{if(m.stageNameId==item.stageNameId)
              //   m.stageNameId ==
              // });
              Alert.alert('Thông báo', 'Đã cập nhật thành công');
            }
          },
        },
      ],
      {cancelable: false},
    );
  };
  const confirmComplete = async () => {
    setLoading(true);
    let userId = await _unitOfWork.storage.getItem(StorageKey.ID);
    const response = await _unitOfWork.user.confirmProductionProcessStageById({
      UserId: userId,
      productionProcessStageId: stageSelected.id,
      WarehouseId: productWarehouse?.warehouseId,
    });
    if (response.statusCode != 200) {
      Alert.alert('Thông báo', response.messageCode);
    } else {
      let list: Array<ProductionProcessStage> = [...processStageTabList];
      list.forEach(stage => {
        if (stage.stageNameId == stageSelected.stageNameId) {
          stage.statusCode = 'TTCDDXN';
          let statusItems = statusList.filter(
            s => s.categoryCode == stage.statusCode,
          );
          if (statusItems.length > 0)
            stage.statusName = statusItems[0].categoryName;
        }
      });
      setProcessStageTabList(list);
      Alert.alert('Thông báo', 'Đã cập nhật thành công');
      setConfirmModalVisible(false);
    }
    setLoading(false);
  };
  const checkConfirmStage = async item => {
    let existErrorStage = item.processErrorStageModels.length > 0;
    if (existErrorStage)
     { 
      let enterDatas=  item.processErrorStageModels?.find(p => p.errorNumber > 0);
      if(enterDatas ==null) existErrorStage = true;
       else existErrorStage = enterDatas.length == 0;
     }
    if (
      item.totalProduction > item.totalReached &&
      (!(item.processListNgModels?.length > 0) || existErrorStage)
    ) {
      Alert.alert(
        'Bạn cần cập nhật danh sách hạng mục lỗi, Nhập kho bán thành phẩm NG trước khi xác nhận hoàn thành công đoạn.',
      );
      return;
    }
    // console.log({stageDetails:item})
    // return;
    if (item.IsEndStage) {
      setStageSelected(item);
      setConfirmModalVisible(true);
    } else {
      let str = 'Bạn chắc chắn xác nhận hoàn thành công đoạn ' + item.stageName;
      Alert.alert(
        'Xác nhận hoàn thành',
        str,
        [
          {
            text: 'Hủy bỏ',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Đồng ý',
            onPress: async () => {
              setLoading(true);
              let userId = await _unitOfWork.storage.getItem(StorageKey.ID);
              const response =
                await _unitOfWork.user.confirmProductionProcessStageById({
                  UserId: userId,
                  productionProcessStageId: item.id,
                });
              //console.log({Data2:response})
              if (response.statusCode != 200) {
                Alert.alert('Thông báo', response.messageCode);
              } else {
                let list: Array<ProductionProcessStage> = [
                  ...processStageTabList,
                ];
                list.forEach(stage => {
                  if (stage.stageNameId == item.stageNameId) {
                    stage.statusCode = 'TTCDDXN';
                    let statusItems = statusList.filter(
                      s => s.categoryCode == stage.statusCode,
                    );
                    if (statusItems.length > 0)
                      stage.statusName = statusItems[0].categoryName;
                  }
                });
                setProcessStageTabList(list);
                // processStageTabList.forEach(m=>{if(m.stageNameId==item.stageNameId)
                //   m.stageNameId ==
                // });
                Alert.alert('Thông báo', 'Đã cập nhật thành công');
              }
              setLoading(false);
            },
          },
        ],
        {cancelable: false},
      );
    }
  };
  const [materials, setMaterial] = useState<Array<any>>([]);
  const navigation = useNavigation();
  const [index, setIndex] = React.useState(0);

  const [routes, setRoutes] = useState<Array<any>>([
    // { key: '1', stageGroupName: 'LTV' },
    // { key: '2', stageGroupName: 'CF' },
    // { key: '3', stageGroupName: 'Hoàn thiện' },
    // { key: '4', stageGroupName: 'Kiểm tra' },
    // { key: '5', stageGroupName: 'Đóng gói' }
  ]);
  const [failPhases, setFailPhases] = useState([
    // {
    //   Id :"1",
    //   Stage: "1.Bọt khí",
    //   Quantity: 8,
    // },
    // {
    //   Id :"2",
    //   Stage: "2.Dị vật",
    //   Quantity: 1,
    // },
    // {
    //   Id :"3",
    //   Stage: "4a.Xước trên bề mặt (PFA)",
    //   Quantity: 3,
    // },
    // {
    //   Id :"4",
    //   Stage: "4b.Xước phần đầu ống (Lỗi lắp đặt)",
    //   Quantity: "",
    // },
    // {
    //   Id :"5",
    //   Stage: "5a.Lõi thép(NSX)",
    //   Quantity: "",
    // },
  ]);
  const failPhaseHeader = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#E6E6E6',
        borderColor: 'black',
        borderWidth: 1,
        height: 60,
      }}>
      <View
        style={{
          height: '100%',
          width: 500,
          borderRightColor: 'black',
          borderRightWidth: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Hạng mục lỗi</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: 200,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Số lượng</Text>
      </View>
    </View>
  );
  const renderFailPhaseGrid = ({item, index}) => {
    return (
      <View style={{...styles.tableRow, backgroundColor: 'white'}}>
        <View
          style={{
            height: '100%',
            width: 500,
            borderRightColor: color.lightGrey,
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <Text style={styles.columnRowTxt}>{item?.errorItemName}</Text>
        </View>

        <View
          style={{
            height: '100%',
            width: 200,
            borderRightColor: 'black',
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <Text style={[styles.columnRowTxt, {textAlign: 'center'}]}>
            {item?.errorNumber}
          </Text>
        </View>
      </View>
    );
  };
  const renderMaterialGrid = ({item, index}) => {
    return (
      <View style={{...styles.tableRow, backgroundColor: 'white'}}>
        <View
          style={{
            height: '100%',
            width: '38%',
            borderRightColor: color.lightGrey,
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <Text style={styles.columnRowTxt}>{item?.productName}</Text>
        </View>
        <View
          style={{
            height: '100%',
            width: '12%',
            borderRightColor: color.black,
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <Text style={styles.columnRowTxt}>{item?.productUnitName}</Text>
        </View>
        <View
          style={{
            height: '100%',
            width: '15%',
            borderRightColor: color.black,
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <Text style={styles.columnRowTxt}>{item?.lotNoName}</Text>
        </View>
        <View
          style={{
            height: '100%',
            width: '15%',
            borderRightColor: color.black,
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <Text style={styles.columnRowTxt}>{item?.inventoryNumber}</Text>
        </View>
        <View
          style={{
            height: '100%',
            width: '20%',
            borderRightColor: 'black',
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <TextInput
            keyboardType="numeric"
            style={{
              borderColor: color.lightGrey,
              borderWidth: 1.5,
              width: '80%',
              height: 45*heightRate,
              fontSize: fonsize+2,
              textAlign: 'right',
              alignSelf: 'center',
              paddingBottom:3
            }}
            onChangeText={str => {
              let value = Number(str);
              let _materials = [...materials];
              if (item.inventoryNumber < value || value < 0)
                return;
                _materials.forEach(material => {
                if(material.productId ==item.productId && material.lotNoId ==item.lotNoId) material.productionNumber = value;
              });              
              setMaterial(_materials);
            }}
            value={item?.productionNumber.toString()}></TextInput>
        </View>
      </View>
    );
  };
  const materialListHeader = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#E6E6E6',
        borderColor: 'black',
        borderWidth: 1,
        height: 45,
      }}>
      <View
        style={{
          height: '100%',
          width: '38%',
          borderRightColor: 'black',
          borderRightWidth: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderModal}>Nguyên liệu</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: '12%',
          borderRightColor: 'black',
          borderRightWidth: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderModal}>Đơn vị tính</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: '15%',
          borderRightColor: 'black',
          borderRightWidth: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderModal}>Lot.No</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: '15%',
          borderRightColor: 'black',
          borderRightWidth: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderModal}>Số lượng tồn</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: '20%',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderModal}>Số lượng sản xuất</Text>
      </View>
    </View>
  );
  return (
    <>
     {isLoading && <CenterSpinner />}
      <Screen style={ROOT} preset="fixed">
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView, {width: '63%'}]}>
              <Text style={styles.headerTitle}>Thống kê hạng mục lỗi</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  width: '98%',
                  marginVertical: 10,
                }}>
                <Text style={{fontSize: 22, fontWeight: '600'}}>
                  Công đoạn:{' '}
                </Text>
                <Text style={styles.headerTitle}>
                  {processStageError?.stageName}
                </Text>
              </View>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  marginBottom: 150,
                }}>
                <FlatList
                  data={failPhases}
                  style={{margin: 10}}
                  keyExtractor={(item, index) => index + ''}
                  ListHeaderComponent={failPhaseHeader}
                  stickyHeaderIndices={[0]}
                  renderItem={renderFailPhaseGrid}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  height: 70,
                  position: 'absolute',
                  bottom: 30,
                  justifyContent: 'center',
                  width: '100%',
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginTop: 20,
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity
                    style={[styles.blueButton, {width: 150, height: 55}]}>
                    <Text
                      style={{
                        fontSize: 22,
                        color: 'white',
                        textAlign: 'center',
                      }}
                      onPress={() => setModalVisible(!modalVisible)}>
                      OK
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}
                          >
                            <Text style={styles.textStyle}>Hide Modal</Text>
                          </Pressable> */}
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modaConfirmlVisible}
          onRequestClose={() => {
            setConfirmModalVisible(!modaConfirmlVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView, {width: '60%', height: 460}]}>
              <Text style={[styles.headerTitle, {fontSize: fonsize + 3}]}>
                Xác nhận
              </Text>
              <View
                style={{flexDirection: 'row', marginLeft: 50, marginTop: 20}}>
                <Text style={styles.headerText}>Số lượng thành phẩm OK: </Text>
                <Text style={{fontSize: 22, fontWeight: '800', flex: 1}}>
                  {stageSelected.totalReached}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  marginLeft: 50,
                  marginTop: 30,
                  marginRight: 40,
                }}>
                <Text style={styles.headerText}>
                  Số lượng thành phẩm pending:{' '}
                </Text>
                <Text style={{fontSize: 22, fontWeight: '800', flex: 1}}>
                  {stageSelected.totalPending}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', marginLeft: 50, marginTop: 30}}>
                <Text style={styles.headerText}>Kho nhập:</Text>
                <View style={{flex: 1, marginLeft: 10, alignSelf: 'center'}}>
                  <SelectDropdown
                    data={productWarehouseNames}
                    onSelect={(selectedItem, index) => {
                      getMaterials(index);
                      setProductwarehouse(productWarehouses[index]);
                    }}
                    defaultValue={
                      productWarehouseNames.length > 0
                        ? productWarehouseNames[0]
                        : null
                    }
                    renderDropdownIcon={() => {
                      return (
                        <Ionicons
                          name="chevron-down-outline"
                          size={24}
                          color={color.black}
                        />
                      );
                    }}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      // text represented after item is selected
                      // if data array is an array of objects then return selectedItem.property to render after item is selected
                      return selectedItem;
                    }}
                    buttonStyle={styles.dropButton}
                    buttonTextStyle={styles.dropText}
                    rowTextStyle={{fontSize: fonsize}}
                    rowTextForSelection={(item, index) => {
                      // text represented for each item in dropdown
                      // if data array is an array of objects then return item.property to represent item in dropdown
                      return item;
                    }}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  marginLeft: 50,
                  marginTop: 30,
                  marginRight: 40,
                }}>
                <Text style={styles.headerText}>
                  Bạn chắc chắn muốn xác nhận hoàn thành công đoạn và nhập thành
                  phẩm sản xuất vào kho thành phẩm{' '}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  height: 70,
                  position: 'absolute',
                  bottom: 30,
                  justifyContent: 'flex-end',
                  width: '100%',
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginLeft: 10,
                    marginTop: 20,
                    justifyContent: 'flex-end',
                    marginRight: 10,
                  }}>
                  <TouchableOpacity
                    style={styles.whiteButton}
                    onPress={() =>
                      setConfirmModalVisible(!modaConfirmlVisible)
                    }>
                    <Text style={{fontSize: 22, color: 'black'}}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.blueButton, {width: 150, height: 55}]}
                    onPress={() => confirmComplete()}>
                    <Text
                      style={{
                        fontSize: 22,
                        color: 'white',
                        textAlign: 'center',
                      }}>
                      Xác nhận
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalMaterialVisible}
          onRequestClose={() => {
            setModalMaterialVisible(!modalMaterialVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.headerTitle}>
                Danh sách nguyên vật liệu đầu vào công đoạn
              </Text>
              <View style={{flexDirection: 'row', marginLeft: 15}}>
                <Text style={styles.headerText}>Kho xuất*:</Text>
                <View style={{flex: 1, marginLeft: 10, alignSelf: 'center'}}>
                  <SelectDropdown
                    data={warehouseNames}
                    onSelect={(selectedItem, index) => {
                      getMaterials(index);
                      setwarehouse(warehouses[index]);
                    }}
                    defaultValue={
                      warehouseNames.length > 0 ? warehouseNames[0] : null
                    }
                    renderDropdownIcon={() => {
                      return (
                        <Ionicons
                          name="chevron-down-outline"
                          size={24}
                          color={color.black}
                        />
                      );
                    }}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      // text represented after item is selected
                      // if data array is an array of objects then return selectedItem.property to render after item is selected
                      return selectedItem;
                    }}
                    buttonStyle={styles.dropButton}
                    buttonTextStyle={styles.dropText}
                    rowTextStyle={{fontSize: fonsize}}
                    rowTextForSelection={(item, index) => {
                      // text represented for each item in dropdown
                      // if data array is an array of objects then return item.property to represent item in dropdown
                      return item;
                    }}
                  />
                </View>
              </View>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  marginBottom: 150,
                }}>
                <ScrollView automaticallyAdjustKeyboardInsets={true}>
                  <FlatList
                    data={materials.filter(p=>p.inventoryNumber>0)}
                    style={{margin: 10}}
                    keyExtractor={(item, index) => index + ''}
                    ListHeaderComponent={materialListHeader}
                    stickyHeaderIndices={[0]}
                    renderItem={renderMaterialGrid}
                  />
                </ScrollView>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  height: 60,
                  position: 'absolute',
                  bottom: 30,
                  justifyContent: 'flex-end',
                  width: '100%',
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginLeft: 10,
                    marginTop: 20,
                    justifyContent: 'flex-end',
                    marginRight: 10,
                  }}>
                  <TouchableOpacity
                    style={[styles.whiteButton,{width: 150*widthRate, height: 55*heightRate}]}
                    onPress={() =>
                      setModalMaterialVisible(!modalMaterialVisible)
                    }>
                    <Text style={{fontSize: fonsize + 2, color: 'black'}}>
                      Hủy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                   style={[styles.blueButton, {width: 150*widthRate, height: 55*heightRate}]}
                    onPress={() => ConfirmMaterial()}>
                    <Text
                      style={{
                        fontSize: fonsize + 2,
                        color: 'white',
                        textAlign: 'center',
                      }}>
                      Xác nhận
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              // navigation.navigate('DashboardScreen', {screen: 'DashboardScreen'});
              navigation.goBack();
            }}>
            <Ionicons
              name="chevron-back-outline"
              size={32 * heightRate}
              color="white"
            />
          </TouchableOpacity>
          <Text
            style={{fontSize: fonsize + 2, fontWeight: '600', color: 'white'}}>
            BẢNG KIỂM TRA QC
          </Text>
          <TouchableOpacity onPress={() => {}}>
            <View style={{flexDirection: 'row'}}>
              <View>
                <Image
                  source={{uri: `${user_avatar}`}}
                  style={{
                    height: 40 * heightRate,
                    width: 40 * heightRate,
                    borderRadius: 20,
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: fonsize + 2,
                  fontWeight: '600',
                  color: 'white',
                  marginLeft: 10,
                }}>
                {full_name}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{backgroundColor: '#182954', opacity: 0.05, height: 1}}></View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              marginLeft: 30,
              justifyContent: 'flex-start',
              height: 45 * heightRate,
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.textNomal}>Khách hàng: </Text>
              <Text style={styles.textBold}>{lotdata?.customerName}</Text>
            </View>
            <View style={{flexDirection: 'row', marginLeft: 20}}>
              <Text style={styles.textNomal}>Sản phẩm: </Text>
              <Text style={styles.textBold}>{lotdata?.productName}</Text>
            </View>
            <View style={{flexDirection: 'row', marginLeft: 20}}>
              <Text style={styles.textNomal}>Lot No: </Text>
              <Text style={styles.textBold}>{lotdata?.lotNoName}</Text>
            </View>
            <View style={{flexDirection: 'row', marginLeft: 20}}>
              <Text style={styles.textNomal}>Tổng số lượng: </Text>
              <Text style={styles.textBold}>{lotdata?.quantityReached}</Text>
            </View>
            <View style={{flexDirection: 'row', marginLeft: 20}}>
              <Text style={styles.textNomal}>Trạng thái: </Text>
              <Text
                style={[
                  styles.textNomal,
                  {color: '#0664F6', fontSize: fonsize + 2},
                ]}>
                {lotdata?.statusName}
              </Text>
            </View>
          </View>
          <View style={{height: layout.height - 200 * heightRate}}>
            <View
              style={{
                height: 45 * heightRate,
                marginRight: 5,
                marginTop: 3,
                marginBottom: 4,
                flexDirection: 'row',
              }}>
              {routes.map(item => (
                <TouchableOpacity
                  onPress={() => {
                    SelectButtonStage(item);
                  }}>
                  <View
                    style={
                      buttonIdSelected == item.stageGroupId
                        ? [
                            styles.tabItemSelected,
                            {width: layout.width / routes.length - 2},
                          ]
                        : [
                            styles.tabItem,
                            {width: layout.width / routes.length - 2},
                          ]
                    }>
                    {
                      <Text
                        style={{
                          color: 'black',
                          textAlign: 'center',
                          marginVertical: 4,
                          fontSize: fonsize + 2,
                        }}>
                        {item.stageGroupName}
                      </Text>
                    }
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{flex: 1, flexDirection: 'column'}}>
              <View style={{flexDirection: 'row', height: 65 * heightRate}}>
                <View style={{width: 350, height: 60 * heightRate}}>
                  <View
                    style={[
                      styles.inputSection,
                      {minHeight: 50 * heightRate, borderColor: 'gray',marginLeft:10},
                    ]}>
                    <TextInput
                      // style={{fontSize: fonsize, paddingBottom: 5}}
                      style={{...styles.search_input, marginHorizontal:10}}
                      placeholder="Tìm kiếm trong danh sách"
                      editable={true}
                      onChangeText={searchString => {
                        searchStage(searchString);
                      }}
                      underlineColorAndroid="transparent"
                    />
                    <Ionicons
                      name={'search'}
                      size={32 * heightRate}
                      color="#080808"
                      style={styles.inputStartIcon}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    width: 380,
                    marginLeft: 40,
                    height: 55 * heightRate,
                  }}>
                  <Text style={styles.headerText}>Trạng thái:</Text>
                  <View style={{flex: 1, marginLeft: 10, alignSelf: 'center'}}>
                    <SelectDropdown
                      data={statusListName}
                      onSelect={(selectedItem, index) => {
                        if (index == 0) {
                          let _processStageTabList =
                            lotdata?.processStageModels.filter(
                              p => p.stageGroupId == buttonIdSelected,
                            );
                          setProcessStageTabList(_processStageTabList);
                        } else {
                          let selectItem = statusList[index - 1];
                          let _processStageTabList =
                            lotdata?.processStageModels.filter(
                              p =>
                                p.statusCode == selectItem.categoryCode &&
                                p.stageGroupId == buttonIdSelected,
                            );
                          setProcessStageTabList(_processStageTabList);
                        }
                      }}
                      defaultValue={
                        statusListName.length > 0 ? statusListName[0] : null
                      }
                      renderDropdownIcon={() => {
                        return (
                          <Ionicons
                            name="chevron-down-outline"
                            size={fonsize + 2}
                            color={color.black}
                          />
                        );
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        // text represented after item is selected
                        // if data array is an array of objects then return selectedItem.property to render after item is selected
                        return selectedItem;
                      }}
                      buttonStyle={styles.dropButton}
                      buttonTextStyle={styles.dropText}
                      rowTextStyle={{fontSize: fonsize}}
                      rowTextForSelection={(item, index) => {
                        // text represented for each item in dropdown
                        // if data array is an array of objects then return item.property to represent item in dropdown
                        return item;
                      }}
                    />
                  </View>
                </View>
              </View>
              <View>
                <FlatList
                  data={processStageTabList}
                  style={{marginHorizontal: 10, marginBottom: 5}}
                  keyExtractor={(item, index) => index + ''}
                  ListHeaderComponent={tableHeader}
                  stickyHeaderIndices={[0]}
                  renderItem={renderItemGrid}
                />
              </View>
            </View>
          </View>
        </View>
      </Screen>
    </>
  );
});

const styles = StyleSheet.create({
  box_search: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: color.lighterGrey,
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: color.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 3,
    backgroundColor: color.black,
  },
  tabbar: {
    backgroundColor: '#fff',
  },
  text_header: {
    fontWeight: '700',
    fontSize: 18,
    color: color.black,
  },
  top_container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  text: {
    fontWeight: '400',
    fontSize: 14,
    color: color.black,
  },
  text_2: {
    marginTop: 6,
    color: '#797979',
    fontWeight: '400',
    fontSize: 15,
  },
  text_btn: {
    fontWeight: '500',
    fontSize: 15,
    color: color.white,
  },
  textBold: {
    fontSize: fonsize + 2,
    paddingVertical: 10,
    fontWeight: '500',
    textAlign: 'center',
    color: color.black,
    height: 60,
    backgroundColor: 'transparent',
  },
  textNomal: {
    fontSize: fonsize + 2,
    paddingVertical: 10,
    fontWeight: '400',
    textAlign: 'center',
    color: color.black,
    height: 60,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#f1f1f1',
    // paddingTop: Constants.statusBarHeight,
  },
  tabItem: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginRight: 1,
    borderColor: 'black',
    borderWidth: 1,
  },
  tabItemSelected: {
    backgroundColor: '#E6E6E6',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginRight: 1,
    borderColor: 'black',
    borderWidth: 1,
    width: layout.width / 5,
  },
  inputSection: {
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 6,
    borderColor: color.primary,
    minHeight: 45 * heightRate,
    maxHeight: 45 * heightRate,
    margin: 5,
  },
  input: {
    flex: 1,
    fontSize: fonsize + 1,
    paddingRight: 10,
    paddingLeft: 10,
    alignContent: 'center',
    alignSelf: 'center',
    textAlignVertical: 'center',
    height: 40 * heightRate,
    backgroundColor: '#fff',
    color: '#424242',
  },
  inputStartIcon: {
    marginHorizontal: 5,
    // color: "#9098B1",
  },
  headerText: {
    fontSize: fonsize + 2,
    color: 'black',
    alignSelf: 'center',
  }, 
  search_input: {
    flex: 1,
    fontSize: fonsize,
    paddingTop: 10*heightRate,
    paddingRight: 10,
    paddingBottom: 10*heightRate,
    paddingLeft: 0,
    backgroundColor: '#fff',
    color: '#424242',
},
  headerTitle: {
    fontSize: fonsize + 2,
    color: 'black',
    width: '98%',
    fontWeight: '700',
    textAlign: 'left',
    alignSelf: 'center',
  },
  containerButton: {
    height: 50,
    width: 110,
    marginLeft: '5%',
    borderRadius: 8,
    borderColor: 'black',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  dropButton: {
    width: '100%',
    backgroundColor: color.white,
    borderColor: color.black,
    borderWidth: 1.5,
    borderRadius: 6,
    height: 45 * heightRate,
    maxWidth: 350,
    minWidth: 350,
  },
  dropText: {
    fontSize: fonsize,
  },

  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#E6E6E6',
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
    height: 70,
  },
  tableRow: {
    flexDirection: 'row',
    height: (50 * layout.height) / 844, //1280
    alignItems: 'center',
    borderColor: color.lightGrey,
    borderWidth: 1,
  },
  productRow: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: color.lightGrey,
    borderWidth: 2,
    marginBottom: 10,
    borderRadius: 10,
  },
  productSelected: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'center',
    backgroundColor: '#0B7EE5',
    borderColor: color.lightGrey,
    borderWidth: 2,
    marginBottom: 10,
    borderRadius: 10,
  },
  columnHeader: {
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: color.lightGrey,
    borderWidth: 1.5,
  },
  columnHeaderTxt: {
    color: '#333333',
    fontSize: fonsize + 2,
    alignSelf: 'center',
    fontWeight: '700',
    justifyContent: 'center',
  },
  columnHeaderModal: {
    color: '#333333',
    fontSize: fonsize,
    alignSelf: 'center',
    fontWeight: '500',
    justifyContent: 'center',
  },
  columnRowTxt: {
    textAlign: 'left',
    fontSize: fonsize + 1,
    fontWeight: '600',
    color: '#333333',
    paddingLeft: 5,
  },
  columnRowCenterTxt: {
    textAlign: 'center',
    fontSize: heightRate * 22,
    color: '#333333',
  },
  columnRowStage: {
    textAlign: 'left',
    fontSize: heightRate * 20,
    fontWeight: '700',
    color: '#0579DF',
  },
  whiteButton: {
    height: 45 * heightRate,
    width: widthRate * 150,
    backgroundColor: color.white,
    borderRadius: 8,
    borderColor: 'black',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  blueButton: {
    height: 50,
    width: 140,
    backgroundColor: '#169AF2',
    marginLeft: '5%',
    borderRadius: 8,

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: fonsize + 2,
  },
  modalView: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 35,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    flexDirection: 'column',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    height: '90%',
  },
});
