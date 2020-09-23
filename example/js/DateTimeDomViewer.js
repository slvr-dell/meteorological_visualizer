import { constance } from "./const.js"
import ArrowImageryProvider from "./ArrowImageryProvider.js";
import { getChildDirectoryArray } from "./get_s3_info.js"

var _com = new constance()

const defaultPrefix = _com.defaultPrefix
const bucket = _com.bucket


export async function setDatetimeSelectors(s3, param,imageryLayers,viewerArray) {
    let OptionDic = { "year": [], "monthday": [], "hourminute": [] }
    let Dom_param_dic = { "year": "", "monthday": "", "hourminute": "" }

    if (param == "year" || param == "monthday" || param == "hourminute") {
        for (let key_param in Dom_param_dic) {
            Dom_param_dic[key_param] = document.getElementById(key_param).value
        }
    } else {
        let tmp_Prefix = defaultPrefix

        for (let key_param in Dom_param_dic) {
            console.log(tmp_Prefix)
            let tmp_option = await getChildDirectoryArray(s3, tmp_Prefix, bucket)
            console.log(tmp_option)
            Dom_param_dic[key_param] = tmp_option[tmp_option.length - 1]
            tmp_Prefix = tmp_Prefix + Dom_param_dic[key_param] + "/"
            //ループを崩したほうが可読性が高いかも
        }
    }
    setViewer(imageryLayers, viewerArray, Dom_param_dic);//辞書型にしているので関数の処理を変更する

    OptionDic["year"] = await getChildDirectoryArray(s3, defaultPrefix, bucket)
    OptionDic["monthday"] = await getChildDirectoryArray(s3, defaultPrefix + Dom_param_dic["year"] + "/", bucket)
    OptionDic["hourminute"] = await getChildDirectoryArray(s3, defaultPrefix + Dom_param_dic["year"] + "/" + Dom_param_dic["monthday"] + "/", bucket)
    for (let key_param in OptionDic) {
        let selectElem = document.getElementById(key_param)
        selectElem.textContent = null;
        for (let opt of OptionDic[key_param]) {
            let optionElem = document.createElement("option");
            optionElem.setAttribute("option", opt);
            optionElem.textContent = opt
            if (opt == Dom_param_dic[key_param]) {
                optionElem.setAttribute("selected", "selected");
            }
            selectElem.appendChild(optionElem);
        }
    }
}

function setViewer(imageryLayers, viewerArray, yearMonthdayHourminuteArray) {
    console.trace(yearMonthdayHourminuteArray)
    imageryLayers.removeAll();
    for (let i = 1; i < _com.viewerIdArray.length; i++) {
        viewerArray[i].entities.removeAll();
    };
    let aipViewerArray = [];
    _com.aipViewerNumArray.forEach(aipViewerNum => {
        aipViewerArray.push(viewerArray[aipViewerNum]);
    });
    imageryLayers.addImageryProvider(new ArrowImageryProvider({
        maximumLevel: _com.maximumLevel,
        minimumLevel: _com.minimumLevel,
        urlPrefixArray: _com.aipUrlPrefixArray,
        propertyArray: _com.aipPropertyArray,
        drawArray: _com.aipDrawArray,
        pixelSizeArray: _com.aipPixelSizeArray,
        colorBarArray: _com.aipColorBarArray,
        minValueArray: _com.aipMinValueArray,
        maxValueArray: _com.aipMaxValueArray,
        viewerArray: aipViewerArray,
        year: yearMonthdayHourminuteArray["year"],
        monthDay: yearMonthdayHourminuteArray["monthday"],
        hourMinute: yearMonthdayHourminuteArray["hourminute"],
    }));
}