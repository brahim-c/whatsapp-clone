// importing stuff
import express from 'express';
import mongoose from 'mongoose';
import Pusher from 'pusher';
import cors from 'cors';
import Messages from './dbMessages.js';

// app config
const app = express();
const port = process.env.PORT || 9000

const pusher = new Pusher({
    appId: '1096218',
    key: '1a8d1986d0b50ed93da9',
    secret: '962d6dd731dd6f4e0f2a',
    cluster: 'eu',
    encrypted: true
  });


// middlewares
app.use(express.json());
app.use(cors());

/*app.use((req, resp, next) => {
    resp.setHeader('Access-Control-Allow-Origin', '*');
    resp.setHeader('Access-Control-Allow-Headers', '*');
    next();
});
*/


//DB config
const connection_url = 'mongodb+srv://admin:egtHi3NRkGfnskRp@cluster0.atrjo.mongodb.net/whatsappDB?retryWrites=true&w=majority';
mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.once('open', () => {
    console.log('db is connected')

    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log(change);
    


    if (change.operationType === 'insert') {
        const messageDetails = change.fullDocument;
        pusher.trigger('messages', 'inserted', {
            name: messageDetails.name,
            message: messageDetails.message,
            timestamp: new Date().toUTCString(),
        });
    } else {
        console.log('Error  triggering Pusher');
    }

});
});


//api routes
app.get('/', (req, resp) => (resp.status(200).send('hello folks')));

app.post('/messages/new', (req, resp) => {
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            resp.status(500).send(err);
        } else {
            resp.status(201).send(data);
        }
    })
})

app.get('/messages/sync', (req, resp) => {

    Messages.find((err, data) => {
        if (err) {
            resp.status(500).send(err);
        } else {
            resp.status(200).send(data);
        }
    })
})

//listenners
app.listen(port, () => console.log(`Listening on localhost:${port}`));