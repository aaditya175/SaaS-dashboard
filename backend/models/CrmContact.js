import mongoose from 'mongoose';

const crmContactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  company: {
    type: String,
  },
  jobTitle: {
    type: String,
  },
  notes: {
    type: String,
  }
}, {
  timestamps: true,
});

const CrmContact = mongoose.model('CrmContact', crmContactSchema);

export default CrmContact;
