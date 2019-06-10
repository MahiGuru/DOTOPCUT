var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function beforeSaveSchemaUpdate(schema) {
    schema.pre('save', function(next) {
        now = new Date();
        this.updated_at = now;
        if (!this.created_at) { this.created_at = now; }
        next();
    });
}
/**
 * USER SCHEMA * 
 */

var userSchema = mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String },
    mobileNo: { type: String, required: true },
    isTailor: Boolean,
    isDesigner: Boolean,
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(userSchema);
var userModel = mongoose.model('users', userSchema);

/**
 * TAILOR SCHEMA * 
 */

var tailorSchema = mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, required: true },
    shopname: { type: String, required: true },
    desc: { type: String, required: true, min: 20, max: 250 },
    email: { type: String },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    landmark: { type: String },
    pincode: { type: Number },
    location: {
        type: {
            type: String,
            default: 'Point',
            required: true
        },
        coordinates: [Number]
    },
    alternateNumber: Number,
    products: [{ type: Schema.Types.ObjectId, ref: "products" }],
    designers: [{ type: Schema.Types.ObjectId, ref: "designers" }],
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(tailorSchema);
var tailorModel = mongoose.model('tailors', tailorSchema);

/**
 * DESIGNER SCHEMA * 
 */

var designerSchema = mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, required: true },
    designerName: { type: String, required: true },
    desc: { type: String, required: true, min: 20, max: 250 },
    email: { type: String },
    mobileNo: { type: String, required: true },
    address: { type: String },
    location: {
        type: {
            type: String,
            default: 'Point',
            required: true
        },
        coordinates: [Number]
    },
    AlternateNumber: Number,
    products: [{ type: Schema.Types.ObjectId, ref: "products" }],
    tailors: [{ type: Schema.Types.ObjectId, ref: "tailors" }],
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(designerSchema);
var designerModel = mongoose.model('designers', designerSchema);

/**
 * CATEGORY SCHEMA * 
 */

var categorySchema = mongoose.Schema({
    type: { type: String, required: true },
    desc: { type: String, required: true },
    imgName: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(categorySchema);
var categoryModel = mongoose.model('categorys', categorySchema);

/**
 * SUB CATEGORY SCHEMA * 
 */

var frontViewTypeSchema = mongoose.Schema({
    type: { type: String, required: true },
    desc: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId },
    filePath: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(frontViewTypeSchema);
var frontViewModel = mongoose.model('frontViewTypes', frontViewTypeSchema);

/**
 * PRODUCTS SCHEMA * 
 */

var productsSchema = mongoose.Schema({
    title: { type: String, required: true },
    designerName: { type: String },
    designerId: { type: Schema.Types.ObjectId },
    desc: { type: String },
    frontViewTypes: [{ type: Schema.Types.ObjectId, ref: "frontViewTypes" }],
    backTypes: [{ type: Schema.Types.ObjectId, ref: "ref_back_type" }],
    occasionTypes: [{ type: Schema.Types.ObjectId, ref: "ref_occasion_type" }],
    clothTypes: [{ type: Schema.Types.ObjectId, ref: "ref_cloth_type" }],
    bodyTypes: [{ type: Schema.Types.ObjectId, ref: "ref_body_type" }],
    tailorsCount: { type: Number, default: 0 },
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(productsSchema);
var productsModel = mongoose.model('products', productsSchema);


/**
 * TAILOR Designer PRODUCT Relation SCHEMA * 
 */

var tailorDesignerProductRelationSchema = mongoose.Schema({
    tailorId: { type: Schema.Types.ObjectId, ref: 'tailors' },
    designerId: { type: Schema.Types.ObjectId, ref: 'designers' },
    productId: { type: Schema.Types.ObjectId, ref: 'products' },
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(tailorDesignerProductRelationSchema);
var tailorDesignerProductRelationModel = mongoose.model('tailorDesignerProductRelation', tailorDesignerProductRelationSchema);


/**
 * PRODUCT IMAGES SCHEMA * 
 */

var productImageSchema = mongoose.Schema({
    imgNames: [{ type: String }],
    path: { type: String },
    productId: { type: Schema.Types.ObjectId, ref: 'products' },
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(productImageSchema);
var productImageModel = mongoose.model('productImages', productImageSchema);

/**
 * RATINGS SCHEMA * 
 */

var ratingSchema = mongoose.Schema({
    _creator: { type: String, ref: 'products' },
    rating: { type: Number },
    comments: { type: String },
    productId: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId },
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(ratingSchema);
var ratingsModel = mongoose.model('ratings', ratingSchema);

/**
 * LIKES SCHEMA * 
 */

var likeSchema = mongoose.Schema({
    _creator: { type: String, ref: 'products' },
    likes: { type: Number },
    productId: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId },
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(likeSchema);
var likesModel = mongoose.model('likes', likeSchema);

/**
 * HISTORY SCHEMA * 
 */

var deviceSchema = mongoose.Schema({
    deviceId: { type: String },
    registrationToken: { type: String },
    isTailor: { type: String },
    isDesigner: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(deviceSchema);
var appDevicesModel = mongoose.model('appDevices', deviceSchema);

/**
 * HISTORY SCHEMA * 
 */

var historySchema = mongoose.Schema({
    items: { type: Array },
    productId: { type: String },
    visited: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(historySchema);
var historyModel = mongoose.model('history', historySchema);


/**
 * REF BODY TYPE SCHEMA * 
 */

var bodyTypeSchema = mongoose.Schema({
    id: { type: Number },
    type: { type: String },
    desc: { type: String },
    path: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(bodyTypeSchema);
var bodyTypeModel = mongoose.model('ref_body_type', bodyTypeSchema, 'ref_body_type');


/**
 *  BODY TYPE IMAGES SCHEMA * 
 */

var bodyTypeImgSchema = mongoose.Schema({
    bodyType: { type: String },
    desc: { type: String },
    bodyTypeId: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(bodyTypeImgSchema);
var bodyTypeImgModel = mongoose.model('ref_body_type_images', bodyTypeImgSchema);

/**
 *  OCCASION TYPE * 
 */

var occasionTypeSchema = mongoose.Schema({
    id: { type: Number },
    type: { type: String },
    desc: { type: String }
});
var occasionTypeModel = mongoose.model('ref_occasion_type', occasionTypeSchema, 'ref_occasion_type');

/**
 *  CLOTH TYPE SCHEMA * 
 */

var clothTypeSchema = mongoose.Schema({
    id: { type: Number },
    type: { type: String },
    desc: { type: String }
});
var clothTypeModel = mongoose.model('ref_cloth_type', clothTypeSchema, "ref_cloth_type");


/**
 *  BACK TYPE * 
 */

var backTypeSchema = mongoose.Schema({
    id: { type: Number },
    type: { type: String },
    desc: { type: String },
    path: { type: String }
});
var backTypeModel = mongoose.model('ref_back_type', backTypeSchema, 'ref_back_type');

/**
 *  OFFERS SCHEMA * 
 */

var offerSchema = mongoose.Schema({
    itemName: { type: String },
    productId: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(offerSchema);
var offerModel = mongoose.model('offers', offerSchema);

/**
 *  CART SCHEMA * 
 */

var cartSchema = mongoose.Schema({
    itemName: { type: String },
    productId: { type: String },
    totalPrice: Number,
    created_at: { type: Date },
    updated_at: { type: Date }
});
beforeSaveSchemaUpdate(cartSchema);
var cartModel = mongoose.model('cart', cartSchema);



module.exports = {
    User: userModel,
    Tailor: tailorModel,
    Designer: designerModel,
    Category: categoryModel,
    FrontViewType: frontViewModel,
    Products: productsModel,
    ProductImages: productImageModel,
    Ratings: ratingsModel,
    Likes: likesModel,
    History: historyModel,
    BodyType: bodyTypeModel,
    BodyTypeImg: bodyTypeImgModel,
    OccasionType: occasionTypeModel,
    ClothType: clothTypeModel,
    BackType: backTypeModel,
    Cart: cartModel,
    Offers: offerModel,
    AppDevices: appDevicesModel,
    tailorDesignerProductRelation: tailorDesignerProductRelationModel
}