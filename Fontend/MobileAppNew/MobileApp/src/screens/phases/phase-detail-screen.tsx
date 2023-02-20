import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
  KeyboardAvoidingView,
  Dimensions,
  PixelRatio,
  FlatList,
  StyleSheet,
  View,
  ViewStyle,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {Screen} from '../../components';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import CenterSpinner from "../../components/center-spinner/center-spinner";
import {color} from '../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {images} from '../../images';
import {StorageKey, Storage} from '../../services/storage/index';
import SelectDropdown from 'react-native-select-dropdown';
import {UnitOfWorkService} from '../../services/api/unitOfWork-service';
import {AboutUs} from '../../components/modal_AboutUs/AboutUs';
import {
  DatePicker as DateMutilPicker,
  DateObject,
} from 'react-multi-date-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {CheckBox, ListItem} from '@ui-kitten/components';
// import CheckBox from '@react-native-community/checkbox';
import DatePicker from 'react-native-date-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MultiSelect from 'react-native-multiple-select';

const layout = Dimensions.get('window');
const ROOT: ViewStyle = {
  backgroundColor: '#E5E5E5',
  flex: 1,
};
const heightRate = layout.height / 844;
const widthRate = layout.width / 1280;
// const fonsize = Math.round(PixelRatio.roundToNearestPixel(20)) - 2;
const fonsize = (layout.height * 20) / 844;
class Phase {
  Id: string;
  Stage: string;
  ContentCheck: string;
  ColoCommentrHex: string;
  Result: string;
}

export const PhaseDetailScreen = observer(function PhaseDetailScreen(
  props: any,
) {
  const navigation = useNavigation();
  const [stageDetails, setStageDetails] = useState<any>({});
  const [isRefresh, setRefresh] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const {stageDetailData, statusList, maxSortOrder, previousData} =
    props.route.params;
  const isFocus = useIsFocused();
  useEffect(() => {
    fetchData();
  }, [isRefresh, isFocus]);
  const _unitOfWork = new UnitOfWorkService();
  const fetchData = async () => {
    setRefresh(false);

    if (!isRefresh) {
      setLoading(true);
      const _stageDetailData =
        await _unitOfWork.user.getProductionProcessStageById({
          id: stageDetailData.id,
        });
      let _title =
        'CÔNG ĐOẠN ' + _stageDetailData.model.stageName.toUpperCase();
      setTitle(_title);
      setFailPhases(_stageDetailData.model.processErrorStageModels);
      setPersonInCharges(_stageDetailData.model.personInChargeModels);
      //setPersonInChargeName(stageDetailData.personInChargeModels.map(w=>w.employeeName));

      const _warehouse = await _unitOfWork.user.getListWareHouse({
        warehouseType: 3, organizationId:_stageDetailData.model?.departmentId
      });
      const _reuseWarehouse = await _unitOfWork.user.getListWareHouse({
        warehouseType: 2, organizationId:_stageDetailData.model?.departmentId
      });
      const _productWarehouse = await _unitOfWork.user.getListWareHouse({
        warehouseType: 4, organizationId:_stageDetailData.model?.departmentId
      });
      if (_warehouse.listWareHouse?.length > 0)
      setwarehouse(_warehouse.listWareHouse[0]);

      if(_warehouse.listWareHouse!=null)
      setwarehouseNames(_warehouse.listWareHouse?.map(w => w.warehouseName));
      const _productInput =
        await _unitOfWork.user.getProductInputByProductionProcessStageId({
          productionProcessStageId: stageDetailData.id,
          warehouseId: '651160f4-edd7-4e3f-a3a6-de3577035108',
        });
      setProcessStageDetails(_stageDetailData.model.processStageDetailModels);

      console.log({_productWarehouse: _productWarehouse.listWareHouse});
      setStageDetails(_stageDetailData.model);
      setNgQuantity(
        _stageDetailData.model.totalProduction -
          _stageDetailData.model.totalReached -_stageDetailData.model.totalPending,
      );
      if (_stageDetailData.model.selectImplementationDate == null)
        setWorkingDays([]);
      else {
        setWorkingDays(
          _stageDetailData.model.selectImplementationDate?.map(
            date => new Date(date),
          ),
        );
      }  
     
      if(_stageDetailData.model.selectStartPerformerId!=null)    
        setSelectStartPerformers(_stageDetailData.model.selectStartPerformerId);
        else setSelectStartPerformers([])
      if(_stageDetailData.model.selectEndPerformerId!=null)    
      setSelectEndPerformers(_stageDetailData.model.selectEndPerformerId);
        else setSelectEndPerformers([])      
      setMaterial(_productInput.models);
      setWarehouses(_warehouse.listWareHouse);     
            
      setProductWarehouses(_productWarehouse.listWareHouse);
      if(_productWarehouse.listWareHouse?.length>0) setProductwarehouse(_productWarehouse.listWareHouse[0])      
      setProductWarehouseNames(
        _productWarehouse.listWareHouse?.map(w => w.warehouseName),
      );
      setReuseWarehouses(_reuseWarehouse.listWareHouse); 
      if(_reuseWarehouse!=null)
      setReuseWarehouseNames(
        _reuseWarehouse.listWareHouse?.map(w => w.warehouseName),
      ); 
      setLoading(false);
    }
  };

  const [title, setTitle] = React.useState('');
  const {params}: any = useRoute();
  const [value, setValue] = useState(new Date());
  const [personInCharges, setPersonInCharges] = useState<Array<any>>([]);
  const [ngQuantity, setNgQuantity] = useState(0);
  const [sampleItem, setSampleItem] = useState(0);
  const [sampleActualQuantity, setSampleActualQuantity] = useState(0);
  const [totalReuse, setTotalReuse] = useState(0);
  const [goodQuantity, setGoodQuantity] = useState(0);
  const [personInChargeNames, setPersonInChargeName] = useState<Array<any>>([]);
  const [selectStartPerformers, setSelectStartPerformers] = useState([]);
  const [selectEndPerformers, setSelectEndPerformers] = useState([]);

  const onSelectedStartPerformersChange = (selectedItems: Array<any>) => {
    setSelectStartPerformers(selectedItems);  
    let _stageDetails = {...stageDetails};
    _stageDetails.selectStartPerformerId = selectedItems;
    setStageDetails(_stageDetails);
    //console.log({DataTest:_stageDetails.selectStartPerformerId,selectedItems:selectedItems});
  };
  const onSelectedEndPerformersChange = (selectedItems: Array<any>) => {
    setSelectEndPerformers(selectedItems);
   // console.log({DataTest:selectedItems});
    let _stageDetails = {...stageDetails};
    _stageDetails.selectEndPerformerId = selectedItems;
    setStageDetails(_stageDetails);
  };
  const [processStageDetails, setProcessStageDetails] = useState<Array<any>>(
    [],
  );
  const [failPhases, setFailPhases] = useState([]);
  const [datetime, setDatetime] = useState<any>({
    fromDate: new Date(),
  });
  const [optionIndex, setOptionIndex] = useState(0);
  const [datePicker, setDatePicker] = useState(false);
  const [datePickerItem, setDatePickerItem] = useState(false);
  const [isShow, setShow] = useState<any>({
    fromDateTime: false,
    fromDate: false,
    fromTime: false,
    toDate: false,
    toTime: false,
  });
  function format(inputDate) {
    let date, month, year;

    date = inputDate.getDate();
    month = inputDate.getMonth() + 1;
    year = inputDate.getFullYear();

    date = date.toString().padStart(2, '0');

    month = month.toString().padStart(2, '0');

    return `${date}/${month}/${year}`;
  }
  function getTime(inputDate: Date) {
    let hours, mins;
    if (inputDate == null) return '';
    hours = inputDate.getHours();
    mins = inputDate.getMinutes();

    return `${hours}:${mins}`;
  }
  function formatShortDate(inputDate) {
    let date, month, year;

    date = inputDate.getDate();
    month = inputDate.getMonth() + 1;
    date = date.toString().padStart(2, '0');

    month = month.toString().padStart(2, '0');

    return `${date}/${month}`;
  }
  const [date, setDate] = useState(new Date());
  const [modalNGVisible, setModalNGVisible] = useState(false);
  const [modalSampleVisible, setModalSampleVisible] = useState(false);
  const [modalMaterialVisible, setModalMaterialVisible] = useState(false);
  const [modaConfirmlVisible, setConfirmModalVisible] = useState(false);
  const [warehouses, setWarehouses] = useState<Array<any>>([]);
  const [reuseWarehouses, setReuseWarehouses] = useState<Array<any>>([]);
  const [warehouseNames, setwarehouseNames] = useState<Array<any>>([]);
  const [reuseWarehouseNames, setReuseWarehouseNames] = useState<Array<any>>(
    [],
  );
  const [productWarehouse, setProductwarehouse] = useState();
  const [productWarehouseNames, setProductWarehouseNames] = useState<
    Array<any>
  >([]);
  const [productWarehouses, setProductWarehouses] = useState<Array<any>>([]);
  const [materials, setMaterial] = useState<Array<any>>([]);
  const [warehouse, setwarehouse] = useState();
  const [ngWarehouse, setngWarehouse] = useState();
  const [processStageDetailValue, setProcessStageDetailValue] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [workingDays, setWorkingDays] = useState<Array<Date>>([]);
  function onDateSelected(event, value) {
    setDate(value);
    setDatePicker(false);
  }
  const onDateTimeSelected = async value => {
    let list: Array<any> = [...processStageDetails];
    list.forEach(stage => {
      if (stage.id == processStageDetailValue?.productionProcessStageDetailId) {
        let processStageDetailValues = stage.processStageDetailValueModels;
        processStageDetailValues.forEach(processStageDetailValueModel => {
          if (processStageDetailValueModel.id == processStageDetailValue.id) {
            processStageDetailValueModel.value = value.toLocaleString();
          }
        });
      }
    });
    setProcessStageDetails(list);
  };
  const onDateItemSelected = async value => {
    let list: Array<any> = [...processStageDetails];
    list.forEach(stage => {
      if (stage.id == processStageDetailValue?.productionProcessStageDetailId) {
        let processStageDetailValues = stage.processStageDetailValueModels;
        processStageDetailValues.forEach(processStageDetailValueModel => {
          if (processStageDetailValueModel.id == processStageDetailValue.id) {
            processStageDetailValueModel.value = format(value);
          }
        });
      }
    });
    setProcessStageDetails(list);
  };
  const onWorkingDateChange = async value => {
    let _workingDays = [...workingDays];
    let date = _workingDays.find(d => d.getDate() == value.getDate());
    if (date == null) {
      _workingDays.push(value);
      setWorkingDays(_workingDays);
      let _stageDetails = {...stageDetails};
      _stageDetails.selectImplementationDate = _workingDays;
      setStageDetails(_stageDetails);
    }
  };
  const onWorkingDateRemove = async (date, index) => {
    let _workingDays = [...workingDays];
    _workingDays.splice(index, 1);
    setWorkingDays(_workingDays);
    let _stageDetails = {...stageDetails};
    _stageDetails.selectImplementationDate = _workingDays;
    setStageDetails(_stageDetails);
  };
  const onTimeItemSelected = async (value: Date) => {
    let mins, hours;
    mins = value.getMinutes();
    hours = value.getHours();
    let list: Array<any> = [...processStageDetails];
    list.forEach(stage => {
      if (stage.id == processStageDetailValue.productionProcessStageDetailId) {
        let processStageDetailValues = stage.processStageDetailValueModels;
        processStageDetailValues.forEach(processStageDetailValueModel => {
          if (processStageDetailValueModel.id == processStageDetailValue.id) {
            processStageDetailValueModel.value = `${hours}:${mins}`;
          }
        });
      }
    });
    setProcessStageDetails(list);
  };
  const getMaterials = async (index:number) => {
    setLoading(true);
    const _productInput =
      await _unitOfWork.user.getProductInputByProductionProcessStageId({
        productionProcessStageId: stageDetails.id,
        warehouseId: warehouses[index]?.warehouseId,
      });
    setMaterial(_productInput.models);
    setLoading(false);
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
        productionProcessStageId: stageDetails.id,
        WarehouseId: warehouse.warehouseId,
      });
    if (response.statusCode != 200) {
      Alert.alert('Thông báo', response.messageCode);
    } else {
      Alert.alert('Thông báo', 'Đã lưu thành công');
      setModalMaterialVisible(false);
      let _stageDetails = {...stageDetails};
      _stageDetails.statusCode = 'TTCDDTH';
      _stageDetails.statusId = '317916e2-8b91-41c3-9151-62bfdf838cb1';
      _stageDetails.selectImplementationDate = [new Date()];
      _stageDetails.fromTime = new Date().getTime();
      let statusItems = statusList.filter(
        s => s.categoryId == _stageDetails.statusId,
      );
      if (statusItems.length > 0)
        _stageDetails.statusName = statusItems[0].categoryName;
      setStageDetails(_stageDetails);
    }
    setLoading(false);
  };
  const startStage = async () => {
    setLoading(true);
    if (previousData.statusCode != 'TTCDDXN' && previousData.statusCode != '') {
      Alert.alert(
        'Bạn cần hoàn thành công đoạn ' +
          previousData.stageName +
          ' trước khi bắt đầu thực hiện công đoạn này.',
      );
      return;
    }
    if (!stageDetails.isStageWithoutProduct) {
      setLoading(true);
      const _productInput =
        await _unitOfWork.user.getProductInputByProductionProcessStageId({
          productionProcessStageId: stageDetails.id,
          warehouseId: warehouses.length>0? warehouses[0].warehouseId:null,
        });
      setMaterial(_productInput.models);
      setModalMaterialVisible(!modalMaterialVisible);
      setLoading(false);
    } else {
      let str =
        'Bạn chắc chắn muốn bắt đầu thực hiện công đoạn ' +
        stageDetails.stageName;
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
              const response =
                await _unitOfWork.user.confirmProductInputByProductionProcessStageId(
                  {
                    UserId: userId,
                    selectImplementationDate:stageDetails.selectImplementationDate??[],
                    productionProcessStageId: stageDetails.id,
                    warehouseId: warehouse?.warehouseId,
                  },
                );
              setLoading(false);
              if (response.statusCode != 200) {
                Alert.alert('Thông báo', response.messageCode);
              } else {
                let _stageDetails = {...stageDetails};
                _stageDetails.statusCode = 'TTCDDTH';
                _stageDetails.selectImplementationDate = [new Date()];
                _stageDetails.fromTime = new Date().getTime();
                let statusItems = statusList.filter(
                  s => s.categoryCode == _stageDetails.statusCode,
                );
                console.log({statusList: statusList, statusItems: statusItems});
                if (statusItems.length > 0) {
                  _stageDetails.statusName = statusItems[0].categoryName;
                  _stageDetails.statusId = statusItems[0].categoryId;
                }
                setStageDetails(_stageDetails);
                Alert.alert('Thông báo', 'Đã cập nhật thành công');
                setRefresh(true);
              }
            },
          },
        ],
        {cancelable: false},
      );
    }    
  };
  
  const checkCompleteStage = async () => {    
    let isValid = true;
    if(stageDetails.selectImplementationDate ==null || stageDetails.selectImplementationDate.length==0) isValid = false;
    if(stageDetails.selectStartPerformerId ==null || stageDetails.selectStartPerformerId.length==0){
      isValid = false;
    }        
    if((stageDetails.selectEndPerformerId==null || stageDetails.selectEndPerformerId.length==0) && stageDetails.numberPeople>1) isValid = false;
   
    if(stageDetails.totalReached==null) isValid = false;    
    processStageDetails.forEach(stage => {    
        let processStageDetailValues = stage.processStageDetailValueModels;
        processStageDetailValues.forEach(valueModel => {
          if (valueModel.value == null || valueModel.value == "") {
           // console.log({valueModel:valueModel})
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
    let str =
      'Bạn chắc chắn muốn hoàn thành công đoạn ' + stageDetails.stageName;
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
            let _stageDetails = {...stageDetails};
            let statusItems = statusList.filter(
              s => s.categoryCode == 'TTCDHT',
            );
            if (statusItems.length > 0) {
              _stageDetails.statusName = statusItems[0].categoryName;
              _stageDetails.statusId = statusItems[0].categoryId;
              _stageDetails.statusCode = statusItems[0].categoryCode;
            }
            _stageDetails.fromTime = 0;

            _stageDetails.processStageDetailModels.forEach(stage => { 
                 if(stage?.specificationsStageName?.trim()=="Thời gian kết thúc") {
                  let processStageDetailValues = stage.processStageDetailValueModels; 
                  processStageDetailValues.forEach(valueModel => {
                    if (valueModel.value == null || valueModel.value == "") { valueModel.value = getTime(new Date());
                  }
                });
                }                  
          });
           setLoading(true);
            const response = await _unitOfWork.user.saveProductionProcessStage({
              model: _stageDetails,
            });
            setLoading(false);
            if (response.statusCode != 200) {
              Alert.alert('Thông báo', response.messageCode);
            } else {
              setStageDetails(_stageDetails);
              Alert.alert('Thông báo', 'Đã cập nhật thành công');
              setRefresh(true);
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
     console.log({
      UserId: userId,
      productionProcessStageId: stageDetails.id,
      WarehouseId: productWarehouse?.warehouseId,
    }); 
    const response = await _unitOfWork.user.confirmProductionProcessStageById({
      UserId: userId,
      productionProcessStageId: stageDetails.id,
      WarehouseId: productWarehouse?.warehouseId,
    });
    setLoading(false);
    if (response.statusCode != 200) {
      Alert.alert('Thông báo', response.messageCode);
    } else {
      let _stageDetails = {...stageDetails};
      _stageDetails.statusId = 'a49d572b-2263-4c23-979e-54c81232952f';
      _stageDetails.statusCode = 'TTCDDXN';
      let statusItems = statusList.filter(
        s => s.categoryCode == _stageDetails.statusCode,
      );
      if (statusItems.length > 0) {
        _stageDetails.statusName = statusItems[0].categoryName;
        _stageDetails.statusId = statusItems[0].categoryId;
      }
      setStageDetails(_stageDetails);

      // processStageTabList.forEach(m=>{if(m.stageNameId==item.stageNameId)
      //   m.stageNameId ==
      // });
      Alert.alert('Thông báo', 'Đã cập nhật thành công');
      setRefresh(true);
      setConfirmModalVisible(false);
    }
  };
  const checkConfirmStage = async () => { 
    let existErrorStage = stageDetails.processErrorStageModels.length > 0;
    if (existErrorStage)
     { 
      let enterDatas=  stageDetails.processErrorStageModels?.find(p => p.errorNumber > 0);
      if(enterDatas ==null) existErrorStage = true;
       else existErrorStage = enterDatas.length == 0;
     }
    if (
      ngQuantity > 0 &&
      (!(stageDetails.processListNgModels?.length > 0) || existErrorStage)
    ) {
      Alert.alert(
        'Bạn cần cập nhật danh sách hạng mục lỗi, Nhập kho bán thành phẩm NG trước khi xác nhận hoàn thành công đoạn.',
      );
      return;
    }  
    if (stageDetails.isEndStage) {
      setConfirmModalVisible(true);
    } else {
      let str =
        'Bạn chắc chắn xác nhận hoàn thành công đoạn ' + stageDetails.stageName;
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
              //console.log({UserId:userId,productionProcessStageId: stageDetails.id});
              const response =
                await _unitOfWork.user.confirmProductionProcessStageById({
                  UserId: userId,
                  productionProcessStageId: stageDetails.id,
                });
              setLoading(false);
              if (response.statusCode != 200) {
                Alert.alert('Thông báo', response.messageCode);
              } else {
                let _stageDetails = {...stageDetails};
                _stageDetails.statusCode = 'TTCDDXN';
                //  _stageDetails.statusId = "a49d572b-2263-4c23-979e-54c81232952f"
                let statusItems = statusList.filter(
                  s => s.categoryCode == _stageDetails.statusCode,
                );
                if (statusItems.length > 0) {
                  _stageDetails.statusName = statusItems[0].categoryName;
                  _stageDetails.statusId = statusItems[0].categoryId;
                }
                setStageDetails(_stageDetails);

                // processStageTabList.forEach(m=>{if(m.stageNameId==item.stageNameId)
                //   m.stageNameId ==
                // });
                Alert.alert('Thông báo', 'Đã cập nhật thành công');
                setRefresh(true);
              }
            },
          },
        ],
        {cancelable: false},
      );
    }
  };

  const onCheckboxClick = function (item: any, type: any, value: any) {
    let list: Array<any> = [...processStageDetails];
    list.forEach(stage => {
      if (stage.id == item.productionProcessStageDetailId) {
        let processStageDetailValues = stage.processStageDetailValueModels;
        processStageDetailValues.forEach(processStageDetailValueModel => {
          if (processStageDetailValueModel.id == item.id) {
            if (type == 1) {
              if (processStageDetailValueModel.value == 'true')
                processStageDetailValueModel.value = 'false';
              else processStageDetailValueModel.value = 'true';
            }
            if (type == 2) {
              if (processStageDetailValueModel.value?.substring(0, 4) == 'true')
                processStageDetailValueModel.value = 'false';
              else processStageDetailValueModel.value = 'true';
            }
            if (type == 3) {
              processStageDetailValueModel.value = value;
            }
            if (type == 0) {
              if (item.value?.substring(0, 4) == 'true') {
                let newData = 'true|' + value;
                processStageDetailValueModel.value = newData;
              } else {
                let newData = 'false|' + value;
                processStageDetailValueModel.value = newData;
              }
            }
          }
        });
      }
    });
    setProcessStageDetails(list);
  };

  const setAddValue = function (item: any, type: any, value: any) {
    let list: Array<any> = [...processStageDetails];
    list.forEach(stage => {
      if (stage.id == item.id) {
        if (type == 1) stage.machineNumber = value;
        if (type == 2) {
          stage.contenValues = value;
          console.log({data: value});
        }
        if (type == 3) {
          stage.specificationsStageValues = value;
        }
      }
    });

    setProcessStageDetails(list);
  };
  const SaveProcessStageErrorPress = async () => {
    setLoading(true);
    const response = await _unitOfWork.user.saveProductionProcessErrorStage({
      processErrorStageModels: failPhases,
    });
    if (response.statusCode != 200) {
      Alert.alert('Thông báo', response.messageCode);
    } else {
      Alert.alert('Thông báo', 'Đã lưu thành công');
      setModalVisible(false);
      setRefresh(true);
    }
    setLoading(false);
  };
  const NumberSamplesClick = async item => {
    //      console.log({'Model':item})
    //if(item.statusId =="317916e2-8b91-41c3-9151-62bfdf838cb1"){
    setModalSampleVisible(!modalSampleVisible);
    setSampleItem(item);
    //}
  };
  const ImportNg = async () => {
    console.log({Data1: stageDetails});
    // return;
    let totalCancel = ngQuantity - totalReuse;
    setLoading(true);
    let userId = await _unitOfWork.storage.getItem(StorageKey.ID);
    let _warehouseId = ngWarehouse?.warehouseId;
    if (_warehouseId == null && reuseWarehouses.length > 0)
      _warehouseId = reuseWarehouses[0].warehouseId;
    // console.log({userId:userId, totalReuse: totalReuse, productionProcessStageId:stageDetails?.id,TotalCancel: totalCancel, warehouseId:  _warehouseId}) ;
    const response = await _unitOfWork.user.importNG({
      userId: userId,
      totalReuse: totalReuse,
      productionProcessStageId: stageDetails?.id,
      TotalCancel: totalCancel,
      warehouseId: _warehouseId,
    });
    setLoading(false);
    if (response.statusCode != 200) {
      Alert.alert('Thông báo', response.messageCode);
    } else {
      Alert.alert('Thông báo', 'Đã lưu thành công');
      setModalNGVisible(false);
      setRefresh(true);
    }
  };
  const InputActualSample = async () => {
    setModalSampleVisible(!modalSampleVisible);

    let list: Array<any> = [...processStageDetails];
    list.forEach(stage => {
      if (stage.id == sampleItem.id)
        stage.newNumberOfSamples = sampleActualQuantity;
    });

    setProcessStageDetails(list);
  };

  const SaveProductionProcessStage = async _stageDetails => {
    setLoading(true);
    _stageDetails.fromTime = 0; // to save
    _stageDetails.processStageDetailModels = processStageDetails;
    const response = await _unitOfWork.user.saveProductionProcessStage({
      model: _stageDetails,
    });
    setLoading(false);
    if (response.statusCode != 200) {
      Alert.alert('Thông báo', response.messageCode);
    } else Alert.alert('Thông báo', 'Đã lưu thành công');
    setRefresh(true);
  };
  function showDatePicker() {
    setChangeShow('toDate', true);
  }

  function setStageData(item: any) {
    setProcessStageDetailValue(item);
  }
  const setChangeShow = (type, value) => {
    let _isShow = {...isShow};
    _isShow[type] = value;
    setShow(_isShow);
  };

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const tableHeader = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#E6E6E6',
        borderColor: 'black',
        borderWidth: 1,
        height: 50*heightRate,
      }}>
      <View
        style={{
          height: '100%',
          width: '15%',
          borderRightColor: 'black',
          borderRightWidth: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Công đoạn Máy</Text>
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
        <Text style={styles.columnHeaderTxt}>Nội dung kiểm tra</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: '25%',
          borderRightColor: 'black',
          borderRightWidth: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Qui cách ghi chú</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: '10%',
          borderRightColor: 'black',
          borderRightWidth: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Số mẫu thử</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: '35%',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Kết quả</Text>
      </View>
    </View>
  );
  const failPhaseHeader = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#E6E6E6',
        borderColor: 'black',
        borderWidth: 1,
        height: 50*heightRate,
      }}>
      <View
        style={{
          height: '100%',
          width: 500*widthRate,
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
          width: 200*widthRate,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Số lượng</Text>
      </View>
    </View>
  );
  const ngGridHeader = () => (
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
          width: 300,
          borderRightColor: 'black',
          borderRightWidth: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Tên NVL, bán thành phẩm</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: 120,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Đơn vị tính</Text>
      </View>
      <View
        style={{
          height: '100%',
          width: 120,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text style={styles.columnHeaderTxt}>Số lượng NG</Text>
      </View>
    </View>
  );
  const renderControl = ({item, index}) => {
    switch (item.fieldTypeId.toUpperCase()) {
      case 'C29EA01A-0BB9-4995-8578-5D552EF79372': //N'Chọn 1 kết quả',
        return (
          <View
            style={{
              alignItems: 'center', alignContent:'center', height:50*heightRate,
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}>
            <Text
              style={{
                fontSize: fonsize,
                color: 'black',               
                textAlign: 'center',
                alignSelf: 'center',
                marginRight: 8,
              }}>
              {item.firstName}
            </Text>
            <CheckBox
              checked={item.value == 'true' ? true : false}
              onChange={() => {
                onCheckboxClick(item, 1, '');
              }}
              style={{
                transform: [{scaleX: 1.5*heightRate}, {scaleY: 1.5*heightRate}],               
                marginLeft: 6,
              }}></CheckBox>
            <Text
              style={{
                fontSize: fonsize,
                color: 'black',
                fontWeight: '600',
                textAlign: 'center',
                alignSelf: 'center',
                marginRight: 8,
                marginLeft: 8,
              }}>
              {item.lastName}
            </Text>
          </View>
        );
      case 'B7A27304-86D7-4817-A93E-46B482621DD7': // N'Nhập giá trị'
        return (
          <View style={{ alignItems: 'center', alignContent:'center', height:50*heightRate, flexDirection: 'row'}}>
            <Text
              style={{
                fontSize: fonsize,
                color: 'black',               
                textAlign: 'center',
                alignSelf: 'center',
                marginRight: 8,
              }}>
              {item.firstName}
            </Text>
            <TextInput
              onChangeText={text => onCheckboxClick(item, 3, text)}
              value={item.value}
              keyboardType="numeric"
              style={{
                borderColor: color.lightGrey,
                borderWidth: 1.5,
                width: 60,
                height: 43*heightRate,
                fontSize: fonsize,
                paddingBottom:5*heightRate,
                alignSelf: 'center',
                alignContent:'center',             
                textAlign: 'center',
                alignItems: 'center',
              }}
              ></TextInput>
            <Text
              style={{
                fontSize: fonsize,
                color: 'black',              
                textAlign: 'center',
                alignSelf: 'center',
                marginRight: 8,
              }}>
              {item.lastName}
            </Text>
          </View>
        );
      case '3D64EA91-3CB9-40A7-A8BE-2FEF93E5C42C': // N'Nhập tiêu đề Label'
        return (
          <View style={{marginTop: 6, flexDirection: 'row'}}>
            <Text
              style={{
                fontSize: fonsize,
                color: 'black',               
                textAlign: 'center',
                alignSelf: 'center',
                marginRight: 8,
              }}>
              {item.firstName}
            </Text>
            <Text
              style={{
                fontSize: fonsize,
                color: 'black',
                fontWeight: '600',
                textAlign: 'center',
                alignSelf: 'center',
                marginRight: 8,
              }}>
              {item.value}
            </Text>
            <Text
              style={{
                fontSize: fonsize,
                color: 'black',               
                textAlign: 'center',
                alignSelf: 'center',
                marginRight: 8,
              }}>
              {item.lastName}
            </Text>
          </View>
        );
      case '8556D68F-33C9-4ED9-A4E1-66D072F80E84': // Nhập thời gian (giờ:phút)'
        return (
          <View style={{ flexDirection: 'row',alignItems:'center',height:50*heightRate}}>
            { <Text style={{fontSize:fonsize,color:'black', height:50*heightRate,textAlign:'center',alignSelf:'flex-start',marginRight:4,textAlignVertical:'center',alignItems:'center'}}>{item.firstName}</Text>}
            <TouchableOpacity
              style={[styles.inputDate, {minWidth: 80,alignSelf:'center'}]}
              onPress={() => {
                setChangeShow('fromTime', true);
                setStageData(item);
              }}>
              <Text style={{fontSize: fonsize, marginRight: 20}}>
                {item.value}
              </Text>
              <Ionicons name={'calendar-outline'} color="black" size={32*heightRate} />
            </TouchableOpacity>
            { <Text style={{fontSize:fonsize,color:'black', height:50*heightRate,textAlign:'center',alignSelf:'flex-start',marginLeft:4,textAlignVertical:'center'}}>{item.lastName}</Text>}
          </View>
        );
      case '98FA12CE-820A-48E0-96B3-B1C78B7D7095': // Tick + Nhập giá trị'
        return (
          <View style={{alignItems:'center', flexDirection: 'row',height:50*heightRate}}>
            <Text
              style={{
                fontSize: fonsize,
                color: 'black',               
                textAlign: 'center',
                alignSelf: 'center',
                marginRight: 8,
              }}>
              {item.firstName}
            </Text>
            <CheckBox
              checked={item.value?.substring(0, 4) == 'true' ? true : false}
              onChange={() => {
                onCheckboxClick(item, 2, '');
              }}
              style={{
                transform: [{scaleX: 1.5}, {scaleY: 1.5}],
                height: 40*heightRate,
                width: 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}></CheckBox>
            {item.value?.substring(0, 4) != 'true' ? (
              <Text></Text>
            ) : (
              <TextInput
                keyboardType="numeric"
                value={
                  item.value?.split('|').length > 1
                    ? item.value?.split('|')[1]
                    : ''
                }
                onChangeText={str => onCheckboxClick(item, 0, str)}
                style={{
                  borderColor: color.lightGrey,
                  borderBottomWidth: 1.5,
                  width: 60,
                  height: 40*heightRate,
                  fontSize: fonsize + 2,
                  alignSelf: 'center',
                  textAlign: 'center',
                  alignItems: 'center',
                  textAlignVertical: 'center',
                }}
              />
            )}
            {item.value?.substring(0, 4) != 'true' ? (
              <Text></Text>
            ) : (
              <Text
                style={{
                  fontSize: fonsize,
                  color: 'black',               
                  textAlign: 'center',
                  alignSelf: 'center',
                  marginRight: 8,
                  marginBottom: 10,
                }}>
                {item.lastName}
              </Text>
            )}
          </View>
        );
      case '7BF50B4A-0BBD-4519-A392-608B3D7809C8': // Nhập thời gian (Ngày/tháng giờ:phút)'
        return (
          <View style={{ alignItems: 'center', alignContent:'center', height:50*heightRate, flexDirection: 'row'}}>
            <Text
              style={{
                fontSize: fonsize,
                color: 'black',               
                textAlign: 'center',
                alignSelf: 'center',
                marginRight: 8,
              }}>
              {item.firstName}
            </Text>
            <TouchableOpacity
              style={[styles.inputDate, {width: 300}]}
              onPress={() => {
                setChangeShow('fromDateTime', true);
                setStageData(item);
              }}>
              <Text style={{fontSize: fonsize, marginRight: 20}}>
                {item.value}
              </Text>
              <Ionicons name={'calendar-outline'} color="black" size={32*heightRate} />
            </TouchableOpacity>
          </View>
        );
      case '2972B58E-2506-4641-BB83-582A8D08B398': // Nhập thời gian (Ngày)'
        return (
          <View style={{ alignItems: 'center', alignContent:'center', height:50*heightRate, flexDirection: 'row'}}>
            <Text
              style={{
                fontSize: fonsize,
                color: 'black',               
                textAlign: 'center',
                alignSelf: 'center',
              }}>
              {item.firstName}
            </Text>
            <TouchableOpacity
              style={[styles.inputDate, {minWidth: 80, height: 40*heightRate}]}
              onPress={() => {
                setChangeShow('fromDate', true);
                setStageData(item);
              }}>
              <Text style={{fontSize: fonsize - 2}}>{item.value}</Text>
              <Ionicons name={'calendar-outline'} color="black" size={30*heightRate} />
            </TouchableOpacity>
          </View>
        );
      case '3D64EA91-3CB9-40A7-A8BE-2FEF93E5C42C': // Chọn nhiều kết quả'
        return <View style={{marginTop: 6, flexDirection: 'row'}}></View>;
      default:
        return (
          <View style={{alignItems: 'center', alignContent:'center', height:50*heightRate, flexDirection: 'row'}}>
            <Text style={styles.columnRowTxt}>{item.fieldTypeId}</Text>
            <TextInput
              keyboardType="numeric"
              style={{
                borderColor: color.lightGrey,
                borderWidth: 1.5,
                width: 60,
                height: 40*heightRate,
                fontSize: 22,
              }}></TextInput>
          </View>
        );
    }
  };

  const renderItemGrid = ({item, index}) => {
    return (
      <View
        style={{
          ...styles.tableRow,
          backgroundColor: 'white',
          height:
            item?.processStageDetailValueModels
              .map((item: any) => item.lineOrder)
              .filter((value, index, self) => self.indexOf(value) === index)
              .length * 50*heightRate,
        }}>
        <View
          style={{
            height: '100%',
            width: '15%',
            borderRightColor: color.lightGrey,
            borderRightWidth: 1.5,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              width: item?.isShowTextBox ? '70%' : '100%',
            }}>
            <Text style={styles.columnRowTxt}>{item?.stepByStepStageName}</Text>
            {item?.isShowTextBox ? (
              <TextInput
                style={{
                  borderColor: color.lightGrey,
                  borderWidth: 1.5,
                  width: 80*widthRate,
                  marginLeft: 10,
                  height: 40*heightRate,
                  fontSize: fonsize,
                  textAlign: 'right',
                  alignSelf: 'center',
                }}
                onChangeText={str => {
                  setAddValue(item, 1, str);
                }}
                value={item?.machineNumber}></TextInput>
            ) : (
              <Text></Text>
            )}
          </View>
        </View>
        <View
          style={{
            height: '100%',
            width: '15%',
            borderRightColor: 'gray',
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              width: item?.isContentValues ? '70%' : '100%',
            }}>
            <Text style={styles.columnRowTxt}>{item?.contentStageName}</Text>
            {item?.isContentValues ? (
              <TextInput
                style={{
                  borderColor: color.lightGrey,
                  borderWidth: 1.5,
                  width: 80*widthRate,
                  marginLeft: 10,
                  height: 40*heightRate,
                  fontSize: fonsize,
                  textAlign: 'right',
                  alignSelf: 'center',
                }}
                onChangeText={str => {
                  setAddValue(item, 2, str);
                }}
                value={item?.contenValues}></TextInput>
            ) : (
              <Text></Text>
            )}
          </View>
        </View>
        <View
          style={{
            height: '100%',
            width: '25%',
            borderRightColor: 'black',
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              width: item?.isHaveValues ? '70%' : '100%',
            }}>
            <Text style={styles.columnRowTxt}>
              {item?.specificationsStageName}
            </Text>
            {item?.isHaveValues ? (
              <TextInput
                style={{
                  borderColor: color.lightGrey,
                  borderWidth: 1.5,
                  width: 80*widthRate,
                  marginLeft: 10,
                  height: 40*heightRate,
                  fontSize: fonsize,
                  textAlign: 'right',
                  alignSelf: 'center',
                }}
                onChangeText={str => {
                  setAddValue(item, 3, str);
                }}
                value={item?.specificationsStageValues}></TextInput>
            ) : (
              <Text></Text>
            )}
          </View>
        </View>
        <View
          style={{
            height: '100%',
            width: '10%',
            borderRightColor: 'black',
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <TouchableOpacity onPress={() => NumberSamplesClick(item)}>
            {Number(item?.numberOfSamples) !=
              Number(item?.newNumberOfSamples) &&
            Number(item?.newNumberOfSamples) > 0 ? (
              <Text
                style={[
                  styles.columnRowTxt,
                  {textAlign: 'center', color: 'red'},
                ]}>
                {item?.numberOfSamples + '(' + item?.newNumberOfSamples + ')'}
              </Text>
            ) : (
              <Text style={[styles.columnRowTxt, {textAlign: 'center'}]}>
                {item?.numberOfSamples == 10000
                  ? 'Toàn bộ'
                  : item?.numberOfSamples == 0
                  ? ''
                  : item?.numberOfSamples}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <View
          style={{flexDirection: 'column', justifyContent: 'center', flex: 1}}>
          {Array.from(
            new Set(
              item?.processStageDetailValueModels.map(
                (item: any) => item.lineOrder,
              ),
            ),
          ).map(index => {
            return (
              <View style={{width: 400, height: 50*heightRate}}>
                <FlatList
                  horizontal={true}
                  key={'key1'}
                  data={item?.processStageDetailValueModels
                    .filter(value => value.lineOrder == index)
                    .sort((m1, m2) =>
                      m1.sortLineOrder > m2.sortLineOrder ? 1 : -1,
                    )}
                  style={{marginLeft: 2}}
                  keyExtractor={item => '' + item}
                  stickyHeaderIndices={[0]}
                  renderItem={renderControl}
                />
              </View>
            );
          })}
        </View>

        {/* <View   style={{ height:'100%', width:150,  flexDirection:'column',alignItems:'center',justifyContent:'center' }} >
                     <TouchableOpacity onPress={()=>{ setChecked(!checked);}} >
                       {(checked)?
                       <FontAwesome name={'check-square'} size={36} color='#0461F2' style={{}}/>
                      :  <Ionicons name={'square-outline'} size={36} color='#080808' />   }
                      </TouchableOpacity>
                    </View>                                                              */}
      </View>
    );
  };

  const renderFailPhaseGrid = ({item, index}) => {
    return (
      <View style={{...styles.tableRow, backgroundColor: 'white'}}>
        <View
          style={{
            height: '100%',
            width: 500*widthRate,
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
            width: 200*widthRate,
            borderRightColor: 'black',
            borderRightWidth: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <TextInput
            editable={stageDetails?.statusCode == 'TTCDHT'}
            onChangeText={str => {
              failPhases[index].errorNumber = Number(str);
            }}
            keyboardType="numeric"
            style={{
              borderColor: color.lightGrey,
              borderWidth: 1.5,
              width: 120*widthRate,
              height: 46*heightRate,
              fontSize: fonsize+2,
              textAlign: 'center',
              alignSelf: 'center',
              textAlignVertical:'center',
              paddingBottom:3
            }}>
            {item?.errorNumber}
          </TextInput>
        </View>
      </View>
    );
  };
  const renderNGGrid = ({item, index}) => {
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
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('PhaseDetailScreen', {
                company_id: null,
              });
            }}>
            <Text style={styles.columnRowStage}>{item?.Name}</Text>
          </TouchableOpacity>
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
            {item?.Unit}
          </Text>
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
            {item?.Quantity}
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
              paddingRight:5,
              height: 45*heightRate,
              fontSize: fonsize+2,
              textAlign: 'right',
              textAlignVertical:'center',
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
        height: 45*heightRate,
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
        <DatePicker
          mode="time"
          modal
          open={isShow?.fromTime}
          date={new Date()}
          onConfirm={date => {
            setChangeShow('fromTime', false);
            onTimeItemSelected(date);
          }}
          onCancel={() => {
            setChangeShow('fromTime', false);
          }}
        />
        <DatePicker
          mode="date"
          modal
          open={isShow?.fromDate}
          date={new Date()}
          onConfirm={date => {
            setChangeShow('fromDate', false);
            onDateItemSelected(date);
          }}
          onCancel={() => {
            setChangeShow('fromDate', false);
          }}
        />
        <DatePicker
          mode="datetime"
          modal
          open={isShow?.fromDateTime}
          date={new Date()}
          onConfirm={date => {
            setChangeShow('fromDateTime', false);
            onDateTimeSelected(date);
          }}
          onCancel={() => {
            setChangeShow('fromDateTime', false);
          }}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.headerTitle}>Danh mục hạng mục lỗi</Text>
              <View
                style={[
                  styles.inputSection,
                  {                    
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 48*heightRate,
                    width: 150*widthRate,
                    marginTop: 20*heightRate,
                    borderColor: 'gray',
                  },
                ]}>
                <TextInput
                  style={{...styles.search_input, marginHorizontal:10}}
                  placeholder="Tìm kiếm hạng mục"
                  editable={true}
                  onChangeText={searchString => {}}
                  underlineColorAndroid="transparent"
                />
                <Ionicons
                  name={'search'}
                  size={32*heightRate}
                  color="#080808"
                  style={styles.inputStartIcon}
                />
              </View>
              <View
                style={{
                  marginTop: 10*heightRate,
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  marginBottom: 150*heightRate,
                }}>
                <FlatList
                  data={failPhases}
                  style={{margin: 10*heightRate}}
                  keyExtractor={item => '' + item}
                  key={'key2'}
                  ListHeaderComponent={failPhaseHeader}
                  ListFooterComponent={
                    <View style={{marginTop: 15*heightRate, width:  50*widthRate}}>
                      <TouchableOpacity
                        style={[styles.blueButton, {width: 50*widthRate, height: 50*heightRate, minWidth:50*widthRate}]}>
                        <FontAwesome
                          name={'angle-double-down'}
                          size={36*heightRate}
                          color="white"
                          style={{}}
                        />
                      </TouchableOpacity>
                    </View>
                  }
                  stickyHeaderIndices={[0]}
                  renderItem={renderFailPhaseGrid}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  height: 70*heightRate,
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
                    style={{...styles.whiteButton,width: 150*widthRate, height: 55*heightRate}}
                    onPress={() => setModalVisible(!modalVisible)}>
                    <Text style={{fontSize: fonsize + 2, color: 'black'}}>
                      Đóng
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.blueButton, {width: 150*widthRate, height: 55*heightRate}]}
                    onPress={() => {
                      SaveProcessStageErrorPress();
                    }}>
                    <Text
                      style={{
                        fontSize: fonsize + 2,
                        color: 'white',
                        textAlign: 'center',
                      }}>
                      Lưu
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
            <View style={[styles.modalView, {width: '60%', height: 460*heightRate}]}>
              <Text style={[styles.headerTitle, {fontSize: fonsize + 3}]}>
                Xác nhận
              </Text>
              <View
                style={{flexDirection: 'row', marginLeft: 50, marginTop: fonsize}}>
                <Text style={styles.headerText}>Số lượng thành phẩm OK: </Text>
                <Text style={{fontSize: fonsize+2, fontWeight: '800', flex: 1}}>
                  {stageDetails?.totalReached}
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
                  {stageDetails?.totalPending}
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
                  height: 70*heightRate,
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
                    <Text style={{fontSize: fonsize+2, color: 'black'}}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.blueButton, {width: 150*widthRate, height: 55*heightRate}]}
                    onPress={() => confirmComplete()}>
                    <Text
                      style={{
                        fontSize: fonsize+2,
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
            <View style={[styles.modalView, {width: '80%'}]}>
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
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  marginBottom: 150,
                }}>
                <ScrollView automaticallyAdjustKeyboardInsets={true}>
                  <FlatList
                    data={materials.filter(p=>p.inventoryNumber>0)}
                    style={{margin: 10*heightRate}}
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
                  height: 70*heightRate,
                  position: 'absolute',
                  bottom: 10,
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
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalNGVisible}
          onRequestClose={() => {
            setModalNGVisible(!modalNGVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView, {width: '60%', height: 460*heightRate}]}>
              <Text style={[styles.headerTitle, {fontSize: fonsize + 3}]}>
                Danh sách NG
              </Text>

              <View style={{flexDirection: 'row', marginTop: 20*heightRate}}>
                <Text style={styles.headerText}>
                  Tổng số lượng bán thành phẩm NG:{' '}
                </Text>
                <Text style={{fontSize: fonsize+1, fontWeight: '800', flex: 1}}>
                  {ngQuantity}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  marginTop: 30*heightRate,
                  marginRight: 40*widthRate,
                }}>
                <Text style={styles.headerText}>Số lượng tái sử dụng*: </Text>
                {stageDetails.processListNgModels?.length > 0 ? (
                  <Text style={{fontSize: fonsize+2, fontWeight: '600', flex: 1}}>
                    {stageDetails.processListNgModels[0].numberNg}
                  </Text>
                ) : (
                  <TextInput
                    onChangeText={str => {
                      let _totalReuse = Number(str);
                      if(_totalReuse>ngQuantity ||_totalReuse<0)
                        {
                          setTotalReuse(0);
                          return;
                      }  
                      setTotalReuse(_totalReuse);                       
                    }}
                    value={totalReuse.toString()}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      fontSize: fonsize+3,
                      marginRight: 40,
                      textAlign: 'center',
                      marginLeft: 10,
                      height: 55*heightRate,
                      borderColor: 'gray',
                      borderWidth: 1.5,
                    }}></TextInput>
                )}
              </View>
              <View style={{flexDirection: 'row', marginTop: 20*heightRate}}>
                <Text style={styles.headerText}>Số lượng hủy: </Text>
                {stageDetails.processListNgModels?.length > 1 ? (
                  <Text style={{fontSize: fonsize+1, fontWeight: '800', flex: 1}}>
                    {stageDetails.processListNgModels[1].numberNg}
                  </Text>
                ) : (
                  <Text style={{fontSize: fonsize+1, fontWeight: '800', flex: 1}}>
                    {ngQuantity - totalReuse}
                  </Text>
                )}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  marginTop: 26*heightRate,
                }}>
                <Text style={styles.headerText}>Kho nhập*:</Text>
                <View style={{flex: 1, marginLeft: 10, alignSelf: 'center'}}>
                  <SelectDropdown
                    data={reuseWarehouseNames}
                    onSelect={(selectedItem, index) => {
                      setngWarehouse(reuseWarehouses[index]);
                    }}
                    defaultValue={
                      reuseWarehouseNames.length > 0
                        ? reuseWarehouseNames[0]
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
                    rowTextStyle={{fontSize: fonsize+1}}
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
                  height: 70*heightRate,
                  position: 'absolute',
                  bottom: 30*heightRate,
                  justifyContent: 'flex-end',
                  width: '100%',
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginLeft: 10,
                    marginTop: 20*heightRate,
                    justifyContent: 'flex-end',
                    marginRight: 10,
                  }}>
                  <TouchableOpacity
                     style={[styles.whiteButton, {width: 150, height: 55*heightRate}]}
                    onPress={() => setModalNGVisible(!modalNGVisible)}>
                    <Text style={{fontSize: fonsize, color: 'black'}}>Hủy</Text>
                  </TouchableOpacity>
                  {stageDetails.processListNgModels?.length > 0 ? (
                    <Text></Text>
                  ) : (
                    <TouchableOpacity
                      style={[styles.blueButton, {width: 150, height: 55*heightRate}]}
                      onPress={() => ImportNg()}>
                      <Text
                        style={{
                          fontSize: fonsize+1,
                          color: 'white',
                          textAlign: 'center',
                        }}>
                        Xác nhận
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalSampleVisible}
          onRequestClose={() => {
            setModalSampleVisible(!modalSampleVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView, {width: '60%', height: 360*heightRate}]}>
              <Text style={[styles.headerTitle, {fontSize: fonsize+3}]}>
                Thay đổi số lượng mẫu thử
              </Text>
              <View style={{flexDirection: 'row', marginTop: 20}}>
                <Text style={styles.headerText}>
                  Số lượng mẫu thử mặc định:{' '}
                </Text>
                <Text style={{fontSize: 22, fontWeight: '800', flex: 1}}>
                  {sampleItem.numberOfSamples}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  marginTop: 30*heightRate,
                  marginRight: 40,
                }}>
                <Text style={styles.headerText}>Số lượng mẫu thực tế*: </Text>
                <TextInput
                  onChangeText={str => {
                    setSampleActualQuantity(Number(str));
                  }}
                  value={sampleActualQuantity.toString()}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    fontSize: fonsize+3,
                    marginRight: 40,
                    textAlign: 'center',
                    marginLeft: 10,
                    height: 55*heightRate,
                    borderColor: 'gray',
                    borderWidth: 1.5,
                  }}></TextInput>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  height: 70*heightRate,
                  position: 'absolute',
                  bottom: 30*heightRate,
                  justifyContent: 'flex-end',
                  width: '100%',
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginLeft: 10,
                    marginTop: 20*heightRate,
                    justifyContent: 'flex-end',
                    marginRight: 10,
                  }}>
                  <TouchableOpacity
                    style={styles.whiteButton}
                    onPress={() => setModalSampleVisible(!modalSampleVisible)}>
                    <Text style={{fontSize: fonsize+2, color: 'black'}}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.blueButton, {width: 150, height: 55*heightRate}]}
                    onPress={() => InputActualSample()}>
                    <Text
                      style={{
                        fontSize: fonsize+2,
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
        <View
          style={{
            backgroundColor: 'white',
            height: layout.height,
            flexDirection: 'column',
          }}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('LotDetailScreen', {
                  screen: 'LotDetailScreen',
                });
              }}>
              <Ionicons name="chevron-back-outline" size={42*heightRate} color="white" />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: fonsize+4,
                fontWeight: '600',
                color: 'white',
                textAlign: 'center',
                marginLeft: 180,
                backgroundColor: 'transparent',
              }}>
              {title}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                width: 330,
                justifyContent: 'flex-end',
              }}>
              {stageDetails?.statusCode == 'TTCDDTH' && stageDetails?.alert ? (
                <TouchableOpacity
                  onPress={() => {
                    let _stageDetails = {...stageDetails};
                    _stageDetails.alert = false;
                    setStageDetails(_stageDetails);
                    SaveProductionProcessStage(_stageDetails);
                  }}
                  style={[styles.redButton, {backgroundColor: '#BF721F'}]}>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: 130*widthRate,
                      justifyContent: 'flex-start',
                    }}>
                    <FontAwesome
                      name={'bell-slash-o'}
                      size={30*heightRate}
                      color="white"
                      style={{}}
                    />
                    <Text
                      style={{fontSize: fonsize+2, color: 'white', marginLeft: 20}}>
                      Sự cố
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <Text></Text>
              )}
              {stageDetails?.statusCode == 'TTCDDTH' && !stageDetails?.alert ? (
                <TouchableOpacity
                  onPress={() => {
                    let _stageDetails = {...stageDetails};
                    _stageDetails.alert = true;
                    setStageDetails(_stageDetails);
                    SaveProductionProcessStage(_stageDetails);
                  }}
                  style={styles.redButton}>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: 130*widthRate,
                      justifyContent: 'flex-start',
                    }}>
                    <FontAwesome
                      name={'bell-o'}
                      size={30*heightRate}
                      color="white"
                      style={{}}
                    />
                    <Text
                      style={{fontSize: fonsize+2, color: 'white', marginLeft: 20}}>
                      Sự cố
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <Text></Text>
              )}
              {stageDetails?.statusCode == 'TTCDDTH' ? (
                stageDetails?.alert ? (
                  <Text></Text>
                ) : (
                  <TouchableOpacity
                    style={styles.whiteButton}
                    onPress={() => {
                      SaveProductionProcessStage(stageDetails);
                    }}>
                    <Text style={{fontSize: fonsize+2, color: 'black'}}>Lưu</Text>
                  </TouchableOpacity>
                )
              ) : (
                <Text></Text>
              )}
              {stageDetails?.statusCode != 'TTCDCBD' ? (
                <Text></Text>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    startStage();
                  }}
                  style={styles.blueButton}>
                  <Text style={{fontSize: fonsize+2, color: 'white'}}>Bắt đầu</Text>
                </TouchableOpacity>
              )}
              {stageDetails?.statusCode == 'TTCDDTH' && !stageDetails?.alert ? (
                <TouchableOpacity
                  onPress={() => {
                     //startStage();
                    checkCompleteStage();
                  }}
                  style={styles.blueButton}>
                  <Text style={{fontSize: fonsize+2, color: 'white'}}>Hoàn thành</Text>
                </TouchableOpacity>
              ) : (
                <Text></Text>
              )}
              {stageDetails?.statusCode != 'TTCDHT' ? (
                <Text></Text>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    //startStage()
                    checkConfirmStage();
                  }}
                  style={styles.blueButton}>
                  <Text style={{fontSize: fonsize, color: 'white'}}>Xác nhận</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              height: 50*heightRate,
              justifyContent: 'space-between',
              marginBottom: 5,
            }}>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                marginLeft: 10,
              }}>
              <Text style={styles.headerText}>Ngày thực hiện:</Text>

              <View
                style={[
                  styles.inputDate,
                  {minWidth: 120, minHeight: 48*heightRate, justifyContent: 'flex-end'},
                ]}>
                {workingDays.map((date, index) => {
                  return (
                    <TouchableOpacity
                      onPress={() => onWorkingDateRemove(date, index)}>
                      <View style={{flexDirection: 'row', marginRight: 10,alignItems:'center'}}>
                        <Text
                          style={{
                            fontSize: fonsize,
                            fontWeight: '400',
                            color: 'black',
                          }}>
                          {workingDays.length == 1
                            ? format(date)
                            : formatShortDate(date)}
                        </Text>
                        <Text
                          style={{fontSize: fonsize+3, color: 'red', marginLeft: 3}}>
                          x
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity onPress={showDatePicker}>
                  <Ionicons name={'calendar-outline'} color="black" size={32*heightRate} />
                </TouchableOpacity>
              </View>

              <DatePicker
                mode="date"
                modal
                open={isShow?.toDate}
                date={new Date()}
                onConfirm={date => {
                  setChangeShow('toDate', false);
                  onWorkingDateChange(date);
                }}
                onCancel={() => {
                  setChangeShow('toDate', false);
                }}
              />
            </View>
            <View style={{flexDirection: 'row', width: 330*widthRate, marginLeft:10}}>
              {stageDetails?.numberPeople == 1 ? (
                <Text style={styles.headerText}>Người thực hiện:</Text>
              ) : (
                <Text style={styles.headerText}>Người bắt đầu:</Text>
              )}
              <View style={{flex: 1, marginLeft: 15, alignSelf: 'center',marginTop:10,zIndex:1000}}>
                <MultiSelect
                  hideTags
                  items={stageDetails.personInChargeModels}
                  uniqueKey="employeeId"
                  onSelectedItemsChange={onSelectedStartPerformersChange}
                  selectedItems={selectStartPerformers}
                  selectText="Đã chọn"
                  selectedText="người"
                  searchInputPlaceholderText=""
                  onChangeInput={text => console.log(text)}
                  tagRemoveIconColor="#CCC"
                  tagBorderColor="#CCC"
                  tagTextColor="#CCC"
                  styleTextDropdownSelected={{
                    fontSize: fonsize,
                    height: 30*heightRate,
                    textAlign: 'center',
                    alignSelf: 'center',
                    textAlignVertical: 'bottom',
                  }}
                  selectedItemTextColor="#CCC"
                  selectedItemIconColor="#CCC"
                  itemTextColor="#000"
                  displayKey="employeeName"
                  styleTextDropdown={{fontSize: fonsize - 1, height: 30*heightRate}}
                  searchInputStyle={{color: '#CCC'}}
                  submitButtonColor="#00BFA5"
                  submitButtonText="Chọn"                  
                  styleDropdownMenuSubsection ={{height:50*heightRate}}
                />
              </View>
            </View>
            <View style={{flexDirection: 'row', width: 330*widthRate}}>
              {stageDetails?.numberPeople == 1 ? (
                <Text ></Text>
              ) : (
                <Text style={styles.headerText}>Người kết thúc:</Text>
              )}
              {stageDetails?.numberPeople == 1 ? (
                <Text ></Text>
              ) : (
                <View style={{flex: 1, marginLeft: 15, alignSelf: 'center',marginTop:10,zIndex:1000}}>
                <MultiSelect
                  hideTags
                  items={stageDetails.personInChargeModels}
                  uniqueKey="employeeId"
                  onSelectedItemsChange={onSelectedEndPerformersChange}
                  selectedItems={selectEndPerformers}
                  selectText="Đã chọn"
                  selectedText="người"
                  searchInputPlaceholderText=""
                  onChangeInput={text => console.log(text)}
                  tagRemoveIconColor="#CCC"
                  tagBorderColor="#CCC"
                  tagTextColor="#CCC"
                  styleTextDropdownSelected={{
                    fontSize: fonsize,
                    height: 30*heightRate,
                    textAlign: 'center',
                    alignSelf: 'center',
                    textAlignVertical: 'bottom',
                  }}
                  selectedItemTextColor="#CCC"
                  selectedItemIconColor="#CCC"
                  itemTextColor="#000"
                  displayKey="employeeName"
                  styleTextDropdown={{fontSize: fonsize - 1, height: 30*heightRate}}
                  searchInputStyle={{color: '#CCC'}}
                  submitButtonColor="#00BFA5"
                  submitButtonText="Chọn"
                  styleDropdownMenuSubsection ={{height:45*heightRate}}
                />
              </View>
              )}
              
            </View>
            <View style={{flexDirection: 'row', width: 430*widthRate}}>
              <Text style={styles.headerText}>Trạng thái:</Text>
              <Text
                style={[
                  styles.headerText,
                  {marginLeft: 10, fontWeight: '800'},
                ]}>
                {stageDetails?.statusName}
              </Text>
            </View>
          </View>
          <View style={{marginTop: 0, flex: 1}}>
            <FlatList
              data={processStageDetails}
              style={{marginHorizontal: 10, marginBottom: 110, flexGrow: 0}}
              keyExtractor={(item, index) => index + ''}
              ListHeaderComponent={tableHeader}
              stickyHeaderIndices={[0]}
              renderItem={renderItemGrid}
              //   renderItem={({item, index})=> {
              //     return (
              //       <View style={{...styles.tableRow, backgroundColor: "white"}}>
              //                   <View   style={{ height:'100%', width:250, borderRightColor:'black',borderRightWidth:1,flexDirection:'column',justifyContent:'center' }} >
              //                           <Text style={styles.columnRowTxt}>{item?.Stage}</Text>
              //                        </View>
              //                        <View   style={{ height:'100%', width:200, borderRightColor:'black',borderRightWidth:1,flexDirection:'column',justifyContent:'center' }} >
              //                          <Text style={styles.columnRowTxt}>Ngày thực hiện</Text>
              //                       </View>
              //                        <View   style={{ height:'100%', width:200,  borderRightColor:'black',borderRightWidth:1,flexDirection:'column',justifyContent:'center' }} >
              //                           <Text style={styles.columnRowTxt}>Phụ trách</Text>
              //                        </View>
              //                        <View   style={{ height:'100%', width:150,  borderRightColor:'black',borderRightWidth:1,flexDirection:'column',justifyContent:'center' }} >
              //                           <Text style={styles.columnRowTxt}>Trạng thái</Text>
              //                       </View>
              //                        <View   style={{ height:'100%', width:150,  borderRightColor:'black',borderRightWidth:1,flexDirection:'column',justifyContent:'center' }} >
              //                           <Text style={styles.columnRowTxt}>Số lượng đạt</Text>
              //                      </View>
              //                       <View   style={{ height:'100%', width:150,  borderRightColor:'black',borderRightWidth:1,flexDirection:'column',justifyContent:'center' }} >
              //                          <Text style={styles.columnRowTxt}>NG</Text>
              //                      </View>
              //                       <View   style={{ height:'100%', width:140, flexDirection:'column',justifyContent:'center' }} >
              //                         <Text style={styles.columnRowTxt}>Xác nhận</Text>
              //                       </View>
              //               <Text style={[styles.columnRowTxt,{marginLeft:60}]}>{item.EndDate}</Text>
              //           </View>
              //     )
              // }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              height: 70*heightRate,
              position: 'absolute',
              bottom: 15,
              marginBottom: 10,
              justifyContent: 'flex-start',
              width: '100%',
            }}>
            <View
              style={{
                flexDirection: 'row',
                width:
                  stageDetails?.statusCode == 'TTCDHT' ||
                  stageDetails?.statusCode == 'TTCDDXN'
                    ? '18%'
                    : '25%',
              }}>
              <Text style={[styles.BigText, {maxWidth: '60%'}]}>
                Số lượng đầu vào:
              </Text>
              <Text
                style={[
                  styles.BigText,
                  {fontSize: fonsize + 3, marginLeft: 15},
                ]}>
                {stageDetails?.totalProduction}
              </Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                marginLeft: 10,
                width:
                  stageDetails?.statusCode == 'TTCDHT' ||
                  stageDetails?.statusCode == 'TTCDDXN'
                    ? '18%'
                    : '25%',
              }}>
              <Text style={[styles.BigText, {maxWidth: '60%'}]}>
                Tổng số lượng đạt:
              </Text>
              <TextInput
                onChangeText={str => {
                  let _stageDetails = {...stageDetails};
                  let value = Number(str);
                  if (_stageDetails?.totalProduction < value) return;
                  _stageDetails.totalReached = value;
                  _stageDetails.totalNotReached =
                    _stageDetails?.totalProduction - value;
                  setStageDetails(_stageDetails);
                  setNgQuantity(_stageDetails?.totalProduction - value- _stageDetails?.totalPending);
                }}
                value={
                  stageDetails?.totalReached == null
                    ? ''
                    : stageDetails?.totalReached.toString()
                }
                keyboardType="numeric"
                style={{
                  fontSize: fonsize,
                  marginRight: 20,
                  textAlign: 'center',
                  marginLeft: 10,
                  width: 80,
                  height: 45*heightRate,
                  paddingBottom:8*heightRate,
                  borderColor: 'gray',
                  borderWidth: 1.5,
                }}></TextInput>
            </View>
            {stageDetails.isEndStage ? (
              <View
                style={{
                  flexDirection: 'row',
                  width:
                    stageDetails?.statusCode == 'TTCDHT' ||
                    stageDetails?.statusCode == 'TTCDDXN'
                      ? '24%'
                      : '30%',
                }}>
                <Text style={[styles.BigText, {maxWidth: '70%'}]}>
                  Tổng số lượng pending:
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={stageDetails?.totalPending?.toString()}
                  onChangeText={str => {
                    if(Number(str)+stageDetails?.totalReached>stageDetails?.totalProduction) retun
                    let _stageDetails = {...stageDetails};
                    _stageDetails.totalPending = Number(str);
                    setNgQuantity(_stageDetails?.totalProduction - _stageDetails?.totalReached- Number(str));
                    setStageDetails(_stageDetails);
                  }}
                  style={{
                    fontSize: fonsize,
                    marginLeft: 10,
                    width: 80,
                    height: 45*heightRate,
                    textAlign: 'center',
                    alignSelf: 'center',
                    borderColor: 'gray',
                    borderWidth: 1.5,
                    paddingBottom:8*heightRate
                  }}></TextInput>
              </View>
            ) : (
              <Text style={{width: 1}}></Text>
            )}
            <View style={{flexDirection: 'row', marginLeft: 10}}>
              <Text
                style={[
                  styles.BigText,
                  {
                    maxWidth:
                      stageDetails?.statusCode == 'TTCDHT' ||
                      stageDetails?.statusCode == 'TTCDDXN'
                        ? '20%'
                        : '85%',
                  },
                ]}>
                Số lượng NG:
              </Text>
              <Text
                style={[
                  styles.BigText,
                  {fontSize: fonsize + 3, marginLeft: 10},
                ]}>
                {ngQuantity}
              </Text>
              {(stageDetails?.statusCode == 'TTCDHT' ||
                stageDetails?.statusCode == 'TTCDDXN') &&
              !stageDetails?.isStageWithoutNg ? (
                <TouchableOpacity
                  style={[styles.blueButton, {}]}
                  onPress={() => {
                    setModalVisible(!modalVisible);
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      fontSize: fonsize,
                    }}>
                    Danh sách hạng mục lỗi
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={{width: 1}}></Text>
              )}
              {(stageDetails?.statusCode == 'TTCDHT' ||
                stageDetails?.statusCode == 'TTCDDXN') &&
              !stageDetails?.isStageWithoutNg ? (
                <TouchableOpacity
                  style={[styles.blueButton, {}]}
                  onPress={() => {
                    setModalNGVisible(!modalNGVisible);
                    setTotalReuse(ngQuantity);
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      fontSize: fonsize,
                    }}>
                    Nhập kho NG
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={{width: 1}}></Text>
              )}
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
    paddingVertical: 2,
    alignItems: 'center',
    backgroundColor: color.black,
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
  box1: {
    height: 124*heightRate,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: color.xanh_nhat,
    borderRadius: 10,
    marginTop: 16,
  },
  box2: {
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingVertical: 16,
    marginBottom: 16,
  },
  btn: {
    width: 70,
    height: 31*heightRate,
    backgroundColor: color.xanh_nhat,
    alignItems: 'center',
    alignSelf: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 11,
    borderRadius: 5,
  },
  btn_2: {
    width: 295,
    height: 43*heightRate,
    backgroundColor: color.xanh_nhat,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex_row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cricle: {
    width: 32,
    height: 32*heightRate,
    borderRadius: 16,
    marginRight: 15,
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
    paddingVertical: 15,
  },
  text_footer: {
    marginBottom: 15,
    fontSize: 14,
    fontWeight: '400',
    color: 'black',
  },
  modal_container: {
    backgroundColor: color.white,
    width: layout.width - 30,
    height: (layout.height / 10) * 8,
    minHeight: 650*heightRate,
    marginTop: layout.height / 20,
    marginLeft: 15,
    borderRadius: 20,
  },
  modal_container_apply: {
    backgroundColor: '#E5E5E5',
    height: (layout.height / 10) * 8,
    minHeight: 650,
    marginTop: (layout.height / 10) * 2,
    borderRadius: 20,
  },
  header_apply: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 19,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    height: 70*heightRate,
  },
  input: {
    marginVertical: 16,
    paddingVertical: 13,
    borderColor: color.lightGrey,
    borderWidth: 1,
    borderRadius: 6,
    paddingLeft: 15,
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
  input_upload: {
    backgroundColor: color.lighterGrey,
    borderRadius: 6,
    height: 45*heightRate,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 26,
  },
  item_view: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: color.white,
    marginBottom: 16,
    // height: 120,
    borderRadius: 10,
    width: layout.width - 32,
  },
  image_item: {
    width: 50*heightRate,
    height: 50*heightRate,
  },

  whiteButton: {
    minHeight: 43*heightRate,
    width: 150*widthRate,
    backgroundColor: color.white,
    marginLeft: '5%',
    borderRadius: 8,
    borderColor: 'black',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  blueButton: {
    fontSize: fonsize + 2,
    minHeight: 43*heightRate,
    minWidth: 100*widthRate,
    maxWidth: 150*widthRate,
    backgroundColor: '#169AF2',
    marginLeft: '5%',
    borderRadius: 6,
    paddingRight:3,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  redButton: {
    minHeight: 43*heightRate,
    width: 150*widthRate,
    backgroundColor: 'red',
    marginLeft: '5%',
    borderRadius: 8,

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  headerText: {
    fontSize: fonsize,
    color: 'black',
    textAlign: 'center',
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: fonsize + 2,
    color: 'black',
    width: '98%',
    fontWeight: '500',
    textAlign: 'left',
    alignSelf: 'center',
  },
  BigText: {
    fontSize: fonsize,
    color: 'black',
    textAlign: 'center',
    alignSelf: 'center',
  },
  dropButton: {
    width: '100%',
    backgroundColor: color.white,
    borderColor: color.black,
    borderWidth: 1.5,
    borderRadius: 6,
    height: 50*heightRate,
    maxWidth: 350*widthRate,
    minWidth: 350*widthRate,
  },
  dropText: {
    fontSize: fonsize,
  },
  datePicker: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 320*widthRate,
    height: 260*heightRate,
    display: 'flex',
  },
  inputDate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 4,
    borderWidth: 1,
    borderColor: color.black,
    backgroundColor: 'white',
    // paddingHorizontal: 12,
    paddingLeft: 16,
    marginLeft: 4,
    paddingRight: 4,
    paddingVertical: 0,
    borderRadius: 4,
  },

  columnHeaderTxt: {
    color: '#333333',
    fontSize: fonsize,
    alignSelf: 'center',
    fontWeight: '700',
    justifyContent: 'center',
  },
  columnRowTxt: {
    textAlign: 'left',
    fontSize: fonsize,
    color: '#333333',
    marginLeft: 3,
  },
  columnRowStage: {
    textAlign: 'left',
    fontSize: fonsize + 2,
    fontWeight: '500',
    color: '#39B8FC',
  },
  tableRow: {
    flexDirection: 'row',
    height: 50*heightRate,
    alignItems: 'flex-start',
    borderColor: color.lightGrey,
    borderWidth: 1.5,
  },
  inputSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 10,
    borderColor: color.primary,
    minHeight: 56*heightRate,
    maxHeight: 56*heightRate,
    margin: 10,
    width: 500*widthRate,   
    minWidth: 500*widthRate,
  },
  ngHeader: {
    minHeight: 400,
    height: 400*heightRate,
    alignContent: 'flex-start',
    borderRadius: 5,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: color.lightGrey,
    margin: 10,
  },
  ngLotNoList: {
    alignContent: 'flex-start',
    borderRadius: 2,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: color.lightGrey,
    margin: 10,
  },
  ngRowHeader: {
    height: 60,
    alignContent: 'center',
    borderRadius: 5,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    maxHeight: 56,
    margin: 6,
  },
  ngContainer: {
    minHeight: 250,
    height: 250,
    borderColor: 'gray',
    borderRadius: 5,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    margin: 10,
  },
  inputStartIcon: {
    width: 32*heightRate,
    height: 32*heightRate,   
    marginHorizontal: 10,   
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
    paddingVertical: 10*heightRate,
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
    width: 800*widthRate,
    height: '90%',
  },
  modalNGView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 35,
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
    width: 900,
    height: 800,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  columnHeaderModal: {
    color: '#333333',
    fontSize: fonsize,
    alignSelf: 'center',
    fontWeight: '500',
    justifyContent: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
