 angular.module('app', [])
     .directive('fileModel', ['$parse', function($parse) {
         return {
             restrict: 'A',
             link: function(scope, element, attrs) {
                 var model = $parse(attrs.fileModel);
                 var modelSetter = model.assign;

                 element.bind('change', function() {
                     var files = ($(this).get(0).files);
                     scope.$apply(function() {
                         modelSetter(scope, element[0].files);
                     });
                 });
             }
         }
     }])
     .directive('checklistModel', ['$parse', '$compile', function($parse, $compile) {
         // contains
         function contains(arr, item, comparator) {
             if (angular.isArray(arr)) {
                 for (var i = arr.length; i--;) {
                     if (comparator(arr[i], item)) {
                         return true;
                     }
                 }
             }
             return false;
         }

         // add
         function add(arr, item, comparator) {
             arr = angular.isArray(arr) ? arr : [];
             if (!contains(arr, item, comparator)) {
                 arr.push(item);
             }
             return arr;
         }

         // remove
         function remove(arr, item, comparator) {
             if (angular.isArray(arr)) {
                 for (var i = arr.length; i--;) {
                     if (comparator(arr[i], item)) {
                         arr.splice(i, 1);
                         break;
                     }
                 }
             }
             return arr;
         }

         // http://stackoverflow.com/a/19228302/1458162
         function postLinkFn(scope, elem, attrs) {
             // exclude recursion, but still keep the model
             var checklistModel = attrs.checklistModel;
             attrs.$set("checklistModel", null);
             // compile with `ng-model` pointing to `checked`
             $compile(elem)(scope);
             attrs.$set("checklistModel", checklistModel);

             // getter / setter for original model
             var getter = $parse(checklistModel);
             var setter = getter.assign;
             var checklistChange = $parse(attrs.checklistChange);
             var checklistBeforeChange = $parse(attrs.checklistBeforeChange);

             // value added to list
             var value = attrs.checklistValue ? $parse(attrs.checklistValue)(scope.$parent) : attrs.value;


             var comparator = angular.equals;

             if (attrs.hasOwnProperty('checklistComparator')) {
                 if (attrs.checklistComparator[0] == '.') {
                     var comparatorExpression = attrs.checklistComparator.substring(1);
                     comparator = function(a, b) {
                         return a[comparatorExpression] === b[comparatorExpression];
                     };

                 } else {
                     comparator = $parse(attrs.checklistComparator)(scope.$parent);
                 }
             }

             // watch UI checked change
             scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                 if (newValue === oldValue) {
                     return;
                 }

                 if (checklistBeforeChange && (checklistBeforeChange(scope) === false)) {
                     scope[attrs.ngModel] = contains(getter(scope.$parent), value, comparator);
                     return;
                 }

                 setValueInChecklistModel(value, newValue);

                 if (checklistChange) {
                     checklistChange(scope);
                 }
             });

             function setValueInChecklistModel(value, checked) {
                 var current = getter(scope.$parent);
                 if (angular.isFunction(setter)) {
                     if (checked === true) {
                         setter(scope.$parent, add(current, value, comparator));
                     } else {
                         setter(scope.$parent, remove(current, value, comparator));
                     }
                 }

             }

             // declare one function to be used for both $watch functions
             function setChecked(newArr, oldArr) {
                 if (checklistBeforeChange && (checklistBeforeChange(scope) === false)) {
                     setValueInChecklistModel(value, scope[attrs.ngModel]);
                     return;
                 }
                 scope[attrs.ngModel] = contains(newArr, value, comparator);
             }

             // watch original model change
             // use the faster $watchCollection method if it's available
             if (angular.isFunction(scope.$parent.$watchCollection)) {
                 scope.$parent.$watchCollection(checklistModel, setChecked);
             } else {
                 scope.$parent.$watch(checklistModel, setChecked, true);
             }
         }

         return {
             restrict: 'A',
             priority: 1000,
             terminal: true,
             scope: true,
             compile: function(tElement, tAttrs) {
                 if ((tElement[0].tagName !== 'INPUT' || tAttrs.type !== 'checkbox') && (tElement[0].tagName !== 'MD-CHECKBOX') && (!tAttrs.btnCheckbox)) {
                     throw 'checklist-model should be applied to `input[type="checkbox"]` or `md-checkbox`.';
                 }

                 if (!tAttrs.checklistValue && !tAttrs.value) {
                     throw 'You should provide `value` or `checklist-value`.';
                 }

                 // by default ngModel is 'checked', so we set it if not specified
                 if (!tAttrs.ngModel) {
                     // local scope var storing individual checkbox model
                     tAttrs.$set("ngModel", "checked");
                 }

                 return postLinkFn;
             }
         };
     }])
     .value("URLS", {
         BASEURL: "http://localhost:3000/",
         SERVERURL: "http://139.59.78.151/"
     })
     .controller('subcatCtrl', function($scope, $http, $q, URLS) {

         var BASEURL = URLS.BASEURL;
         var SERVERURL = URLS.SERVERURL;
         var config = {
             headers: {
                 'Content-Type': 'application/json'
             }
         };
         $http.get(SERVERURL + "categorys", config).then(function(result) {
             console.log("Data called ", result);
             $scope.categorys = result.data;
         });
         $scope.selectCategoryId = null;
         $scope.uploadFile = function() {
             var file = $scope.ifile;
             console.log($scope.subcTitle, $scope.desc, $scope.selectCategoryId);

             var uploadUrl = SERVERURL + "frontviewtypes";
             var fd = new FormData();
             fd.append("title", $scope.subcTitle);
             fd.append("desc", $scope.desc);
             fd.append("categoryId", $scope.selectCategoryId);
             angular.forEach(file, function(val, i) {
                 fd.append('file', val);
             });
             if (file != undefined && $scope.subcTitle != null && $scope.selectCategoryId != null) {
                 $http.post(uploadUrl, fd, {
                     transformRequest: angular.identity,
                     headers: { 'Content-Type': undefined }
                 }).then(function() {
                     alert("success!!");
                 }, function() {
                     alert("error!!");
                 });
             } else {
                 alert("Fill Mandatory Fields TITLE, FILE, CATEGORYID");
             }
         };

     })
     .controller('typeCtrl', function($scope, $http, $q, URLS) {
         var BASEURL = URLS.BASEURL;
         var SERVERURL = URLS.SERVERURL;
         var config = {
             headers: {
                 'Content-Type': 'application/json'
             }
         };

         var occasionUrl = SERVERURL + "reference/occasiontype";
         var clothtypeUrl = SERVERURL + "reference/clothtype";
         var bodytypeUrl = SERVERURL + "reference/bodyType";
         var backtypeUrl = SERVERURL + "reference/backtype";

         $scope.occasionType = "";
         $scope.occasionDesc = "";

         $scope.bodytype = "";
         $scope.bodydesc = "";

         $scope.clothtype = "";
         $scope.clothdesc = "";

         $scope.backtype = "";
         $scope.backtypedesc = "";

         $scope.selectCategoryId = null;
         $scope.occasionAdd = function() {
             var postdata = {
                 type: $scope.occasionType,
                 desc: $scope.occasionDesc
             }
             console.log(postdata);
             $http.post(occasionUrl, postdata).then(function(data) {
                 alert("success!!");
                 console.log(data);
             }, function() {
                 alert("error!!");
             });
         };
         $scope.clothtypeAdd = function() {
             var clothdata = {
                 imageTypeTitle: "BackViewType",
                 type: $scope.clothtype,
                 desc: $scope.clothdesc
             }
             $http.post(clothtypeUrl, clothdata).then(function(data) {
                 alert("success!!");
                 console.log(data);
             }, function() {
                 alert("error!!");
             });
         };
         $scope.bodytypeAdd = function() {
             var bodytypedata = {
                 type: $scope.bodytype,
                 desc: $scope.bodydesc
             }
             var file = $scope.ifile;

             var uploadUrl = bodytypeUrl;
             var fd = new FormData();
             fd.append("title", "BodyType");
             fd.append("type", $scope.bodytype);
             fd.append("desc", $scope.bodydesc);
             angular.forEach(file, function(val, i) {
                 fd.append('file', val);
             });
             if (file != undefined && $scope.bodytype != null && $scope.bodytype != null) {
                 $http.post(uploadUrl, fd, {
                     transformRequest: angular.identity,
                     headers: { 'Content-Type': undefined }
                 }).then(function() {
                     alert("success!!");
                 }, function() {
                     alert("error!!");
                 });
             } else {
                 alert("Fill Mandatory Fields BODYTYPE, FILE, BODYDESC");
             }
         };
         $scope.backtypeAdd = function() {
             var file = $scope.ifile;

             var uploadUrl = backtypeUrl;
             var fd = new FormData();
             fd.append("title", "BackViewType");
             fd.append("type", $scope.backtype);
             fd.append("desc", $scope.backtypedesc);
             angular.forEach(file, function(val, i) {
                 fd.append('file', val);
             });
             if (file != undefined && $scope.backtype != null && $scope.backtype != null) {
                 $http.post(uploadUrl, fd, {
                     transformRequest: angular.identity,
                     headers: { 'Content-Type': undefined }
                 }).then(function() {
                     alert("success!!");
                 }, function() {
                     alert("error!!");
                 });
             } else {
                 alert("Fill Mandatory Fields BODYTYPE, FILE, BODYDESC");
             }

         };

     })
     .controller('initController', function($scope, $http, $q, URLS) {
         $scope.message = '60 minutes sale is going on!!!';
         /*$http.get(BASEURL + "category").then(function(category) {
             $scope.categorys = category;
         })*/
         $scope.title = "Flash! Flash!! Flash!!!";
         $scope.showLoader = false;
         var BASEURL = URLS.BASEURL;
         var SERVERURL = URLS.SERVERURL;
         $scope.selectedFrontViewTypes = [];
         var config = {
             headers: {
                 'Content-Type': 'application/json'
             }
         };
         $('#carousel-example-generic').collapse({
             toggle: false
         })
         $scope.selectFrontTypes = null;
         $scope.selectedItemChanged = function() {
             //$scope.calculatedValue = $scope.selectSubcategoryId;
             $scope.selectedFrontViewTypes.push($scope.selectedFrontTypes);
         }
         $http.get(SERVERURL + "allproducts").then(function(result) {
             console.log(result, "PRODDDDDDD");
             $scope.products = result.data;
             $scope.showLoader = false;
         });
         $scope.refreshProducts = function() {
             $http.get(SERVERURL + "allproducts").then(function(result) {
                 $scope.products = result.data;
             });
         }
         $scope.pushClick = function() {
             var pushData = {
                 title: $scope.title,
                 content: $scope.message
             }
             console.log(pushData);
             $http.post(SERVERURL + "sendpush", pushData, function(data) {
                 alert("push send >>" + data);
             })
         }
         console.log("called");
         $http.get(SERVERURL + "frontviewtypes", config).then(function(result) {
             console.log("Data called ", result);
             $scope.frontViewTypes = result.data;
         });
         $http.get(SERVERURL + "reference/clothtype", config).then(function(result) {
             console.log("cloth Data called ", result);
             $scope.clothtypes = result.data;
         });
         $http.get(SERVERURL + "reference/bodytype", config).then(function(result) {
             console.log("body Data called ", result);
             $scope.bodytypes = result.data;
         });
         $http.get(SERVERURL + "reference/occasiontype", config).then(function(result) {
             console.log("occasion Data called ", result);
             $scope.occasiontypes = result.data;
         });
         $http.get(SERVERURL + "reference/backtype", config).then(function(result) {
             console.log(" back Data called ", result);
             $scope.backtypes = result.data;
         });
         $scope.selectedOccasions = [];
         $scope.selectedClothes = [];
         $scope.selectedBodyTypes = [];
         $scope.selectedBackTypes = [];
         $scope.selectedFrontViewTypes = [];
         $scope.editEnabled = false;

         $scope.edit_product = function(id) {
             console.log(id);
             $scope.editId = id;
             $scope.editEnabled = true;
             $http.get(SERVERURL + "products/" + id, config).then(function(result) {
                 console.log(" GET PRODUCTS called ", result.data);
                 $scope.prodTitle = result.data.title;
                 $scope.desc = result.data.desc;
                 $scope.selectedOccasions = result.data.occasionTypes;
                 $scope.selectedClothes = result.data.clothTypes;
                 $scope.selectedBodyTypes = result.data.bodyTypes;
                 $scope.selectedBackTypes = result.data.backTypes;
                 $scope.selectedFrontViewTypes = result.data.frontViewTypes;
                 $('a[href="#home"]').tab('show');
             });
         }
         $scope.remove_product = function(pid) {
             $http.delete(SERVERURL + "products/" + pid).then(function(result) {
                 console.log(result);
                 $scope.refreshProducts();
             });
         }
         $scope.createProduct = function() {

             console.log("FRONT VIEW TYPES ", $scope.selectedFrontViewTypes);
             var uploadUrl = SERVERURL + "webproduct";
             var productDetails = {
                 title: $scope.prodTitle,
                 desc: $scope.desc,
                 frontViewTypes: $scope.selectedFrontViewTypes,
                 occasionTypes: $scope.selectedOccasions,
                 clothTypes: $scope.selectedClothes,
                 bodyTypes: $scope.selectedBodyTypes,
                 backTypes: $scope.selectedBackTypes
             }
             $scope.showLoader = true;
             $http.post(uploadUrl, productDetails, {
                 headers: { 'Content-Type': 'application/json' }
             }).then(function(products) {
                 var productId = products.data._id;
                 $scope.uploadFile(productId);
                 $scope.prodTitle = "";
                 $scope.desc = "";
                 $scope.selectedOccasions = [];
                 $scope.selectedClothes = [];
                 $scope.selectedBodyTypes = [];
                 $scope.selectedBackTypes = [];
                 $scope.selectedFrontViewTypes = [];
                 //$scope.uploadFile();
             }, function() {
                 alert("error!!");
                 $scope.showLoader = false;
                 $scope.prodTitle = "";
                 $scope.desc = "";
                 $scope.selectedOccasions = [];
                 $scope.selectedClothes = [];
                 $scope.selectedBodyTypes = [];
                 $scope.selectedBackTypes = [];
                 $scope.selectedFrontViewTypes = [];
             });
         }

         $scope.uploadFile = function(prodId) {
             $scope.showLoader = true;
             var file = $scope.ifile;
             console.log(file, prodId);
             var uploadUrl = SERVERURL + "webuploadimages";
             var fd = new FormData();
             fd.append("productId", prodId);
             angular.forEach(file, function(val, i) {
                 fd.append('file', val);
             });
             if (file != undefined && $scope.prodTitle != null && $scope.selectedFrontViewTypes != null) {
                 $http.post(uploadUrl, fd, {
                     transformRequest: angular.identity,
                     headers: { 'Content-Type': undefined }
                 }).then(function() {
                     alert("success!!");
                     $scope.showLoader = false;
                     $scope.refreshProducts();
                 }, function() {
                     alert("Product Created but image not uploaded error!!");
                     $scope.showLoader = false;
                     $scope.refreshProducts();
                 });
             } else {
                 alert("Fill Mandatory Fields TITLE, FILEs, SUBCATEGORYID");
             }

         }



     });