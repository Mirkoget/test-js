import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
    }
  ],
  historyPay: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      image: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      purchaseDate: { type: String, required: true },
    }
  ],
  myProducts: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      image: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      isSold: { type: Boolean, default: false },
    }
  ]
});

const User = mongoose.model('User', userSchema);

export default User;