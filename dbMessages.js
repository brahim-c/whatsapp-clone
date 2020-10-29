import mongoose from 'mongoose';

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String ,
    sent: Boolean
});

export default mongoose.model('messagecontents', whatsappSchema);