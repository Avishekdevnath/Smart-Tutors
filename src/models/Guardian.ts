import mongoose, { Schema, models, model } from 'mongoose';

const GuardianSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  number: { 
    type: String, 
    required: true, 
    unique: true, 
    validate: {
      validator: function(v: string) {
        return /^\d{10,15}$/.test(v);
      },
      message: (props: any) => `${props.value} is not a valid phone number!`
    }
  },
  address: { 
    type: String, 
    required: true,
    trim: true
  }
}, { timestamps: true });

const Guardian = models.Guardian || model('Guardian', GuardianSchema);
export default Guardian; 