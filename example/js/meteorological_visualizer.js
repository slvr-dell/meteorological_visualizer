import ArrowImageryProvider from "./ArrowImageryProvider.js";
import {getChildDirectoryArray} from "./get_s3_info.js"
import {initDatetimeSelector} from "./DateTimeDomViewer.js"

const http = "https://"
const region = "ap-northeast-1";
const endpoint = "s3.wasabisys.com";
const bucket = "japan.meteorological.agency.open.data.aws.js.s3.explorer";
const urlPrefix = http + "s3." + region + ".wasabisys.com"  + "/" + bucket + "/";
AWS.config.region = region;
var s3 = new AWS.S3({apiVersion: "2014-10-01", endpoint: new AWS.Endpoint(endpoint)});
const defaultPrefix = "bufr_to_arrow/surface/synop/pressure_reduced_to_mean_sea_level/";

var yearOptionArray = [];
var monthdayOptionArray = [];
var hourminuteOptionArray = [];

const yearMonthdayHourminuteIdArray = ["year", "monthday", "hourminute",];

var yearMonthdayHourminuteArray = ["", "", "",];
const sceneMode = Cesium.SceneMode.SCENE3D;
const maximumLevel = 1;
const minimumLevel = 1;
const resolutionScale = 1;
const minimumZoomDistance = 1000000;
const maximumZoomDistance = 6500000;
const percentageChanged = 0.001;
const initialLongitude = 140;
const initialLatitude = 35;
const initialHeight = 6500000;
const viewerIdArray = ["controleViewer", "viewer11", "viewer12", "viewer13", "viewer21", "viewer22", "viewer23"];
var viewerArray = [];
var imageryLayers = new Cesium.ImageryLayerCollection();
var aipViewerNumArray = [1, 2, 3, 4, 5, 6];
var aipUrlPrefixArray = [urlPrefix + "bufr_to_arrow/surface/synop", urlPrefix + "bufr_to_arrow/surface/synop", urlPrefix + "bufr_to_arrow/surface/synop", urlPrefix + "bufr_to_arrow/surface/synop", urlPrefix + "bufr_to_arrow/surface/synop", urlPrefix + "bufr_to_arrow/surface/synop"];
var aipPropertyArray = ["air temperature [K]", "air temperature [K]", "air temperature [K]", "air temperature [K]", "air temperature [K]", "air temperature [K]"];
var aipDrawArray = ["point", "point", "point", "point", "point", "point"];
var aipPixelSizeArray = [5, 5, 5, 5, 5, 5];
var aipColorBarArray = ["pbgrf", "pbgrf", "pbgrf", "pbgrf", "pbgrf", "pbgrf"];
var aipMinValueArray = [280.0, 280.0, 280.0, 280.0, 280.0, 280.0];
var aipMaxValueArray = [290.0, 290.0, 290.0, 290.0, 290.0, 290.0];



document.addEventListener('DOMContentLoaded', function(){
  init()
  yearMonthdayHourminuteIdArray.forEach(yearMonthdayHourminuteId => {
    let select = document.getElementById(yearMonthdayHourminuteId);
    select.addEventListener('change', function(){
      setDatetimeSelectors(s3,yearMonthdayHourminuteId)
    });
  })
});


function setViewer(){
  imageryLayers.removeAll();
  for (let i = 1; i < viewerIdArray.length; i++) {
    viewerArray[i].entities.removeAll();
  };
  let aipViewerArray = [];
  aipViewerNumArray.forEach(aipViewerNum => {
    aipViewerArray.push(viewerArray[aipViewerNum]);
  });
  imageryLayers.addImageryProvider(new ArrowImageryProvider({maximumLevel:maximumLevel, minimumLevel:minimumLevel,
    year: yearMonthdayHourminuteArray[0],
    monthDay: yearMonthdayHourminuteArray[1],
    hourMinute: yearMonthdayHourminuteArray[2],
    urlPrefixArray: aipUrlPrefixArray,
    propertyArray: aipPropertyArray,
    drawArray: aipDrawArray,
    viewerArray: aipViewerArray,
    pixelSizeArray: aipPixelSizeArray,
    colorBarArray: aipColorBarArray,
    minValueArray: aipMinValueArray,
    maxValueArray: aipMaxValueArray
  }));
}



async function setDatetimeSelectors(s3,param){
  //let yearMonthdayHourminuteArray = ["", "", ""]
  let OptionDic = {"year":[],"monthday":[],"hourminute":[]}
  if (param != "year" && param != "monthday" && param != "hourminute") {
    yearOptionArray = await getChildDirectoryArray(s3,defaultPrefix, bucket)
    OptionDic["year"] = yearOptionArray
    yearMonthdayHourminuteArray[0] = yearOptionArray[yearOptionArray.length - 1];
  }
  if (param != "monthday" && param != "hourminute") {
    monthdayOptionArray = await getChildDirectoryArray(s3,defaultPrefix + yearMonthdayHourminuteArray[0] + "/", bucket)
    OptionDic["monthday"] = monthdayOptionArray
    yearMonthdayHourminuteArray[1] = monthdayOptionArray[monthdayOptionArray.length - 1];
  }
  if (param != "hourminute") {
    hourminuteOptionArray = await getChildDirectoryArray(s3,defaultPrefix + yearMonthdayHourminuteArray[0] + "/" + yearMonthdayHourminuteArray[1] + "/", bucket)
    OptionDic["hourminute"] = hourminuteOptionArray
    yearMonthdayHourminuteArray[2] = hourminuteOptionArray[hourminuteOptionArray.length - 1];
  }
  if (param == "year" || param == "monthday" || param == "hourminute") {
    let selectElem = document.getElementById(param);
    let selectedValue = selectElem.value;
    let optionArray = [];
    let idNum = 0;
    selectElem.textContent = null;
    if (param == "year") {
      yearMonthdayHourminuteArray[0] = selectedValue;
      optionArray = yearOptionArray;
      idNum = 0;
    } else if (param == "monthday") {
      yearMonthdayHourminuteArray[1] = selectedValue;
      optionArray = monthdayOptionArray;
      idNum = 1;
    } else if (param == "hourminute") {
      yearMonthdayHourminuteArray[2] = selectedValue;
      optionArray = hourminuteOptionArray;
      idNum = 2;
    }
    for (let i = 0; i < optionArray.length; i++) {
      let optionElem = document.createElement("option");
      optionElem.setAttribute("option", optionArray[i]);
      optionElem.textContent = optionArray[i];
      if (optionArray[i] == selectedValue) {
        optionElem.setAttribute("selected", "selected");
      }
      selectElem.appendChild(optionElem);
    }
    for (let i = idNum + 1; i < yearMonthdayHourminuteIdArray.length; i++) {
      let item = yearMonthdayHourminuteIdArray[i]
      initDatetimeSelector(item,OptionDic[item])
    }
  } else {
    yearMonthdayHourminuteIdArray.forEach(yearMonthdayHourminuteId => {
      initDatetimeSelector(yearMonthdayHourminuteId,OptionDic[yearMonthdayHourminuteId]);
    });
  }
  setViewer();
}


function init(){
  viewerIdArray.forEach(viewerId => {
    let viewer = new Cesium.Viewer(viewerId, {animation:false, baseLayerPicker:false, fullscreenButton:false, geocoder:false, homeButton:false, infoBox:false, sceneModePicker:false, selectionIndicator:false, timeline:false, navigationHelpButton:false, shouldAnimate:true, skyBox:false, skyAtmosphere:false, sceneMode:sceneMode, creditContainer:"c", requestRenderMode:true});
    viewer.resolutionScale = resolutionScale;
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = minimumZoomDistance;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = maximumZoomDistance;
    viewer.camera.percentageChanged = percentageChanged;
    viewer.camera.setView({destination:Cesium.Cartesian3.fromDegrees(initialLongitude, initialLatitude, initialHeight)});
    viewerArray.push(viewer);
  });
  viewerArray[0].camera.changed.addEventListener(() => {
    for (let i = 1; i < viewerIdArray.length; i++) {
      viewerArray[i].camera.position = viewerArray[0].camera.position;
      viewerArray[i].camera.direction = viewerArray[0].camera.direction;
      viewerArray[i].camera.up = viewerArray[0].camera.up;
      viewerArray[i].camera.right = viewerArray[0].camera.right;
    };
  });
  for (let i = 1; i < viewerIdArray.length; i++) {
    viewerArray[i].camera.changed.addEventListener(() => {
      viewerArray[0].camera.position = viewerArray[i].camera.position;
      viewerArray[0].camera.direction = viewerArray[i].camera.direction;
      viewerArray[0].camera.up = viewerArray[i].camera.up;
      viewerArray[0].camera.right = viewerArray[i].camera.right;
    });
  };
  imageryLayers = viewerArray[0].imageryLayers;
  setDatetimeSelectors(s3,"");
}