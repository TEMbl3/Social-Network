const multer = require("multer");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");
const http = require("http");
const socketIo = require("socket.io");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app); // Создаем HTTP сервер
let io = socketIo(server, {
  cors: {},
}); // Инициализируем Socket.IO с сервером

const port = 3000;

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const IMGUR_CLIENT_ID = "ada260c89208c10";

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const form = new FormData();
    form.append("image", req.file.buffer, req.file.originalname);

    const response = await axios.post("https://api.imgur.com/3/image", form, {
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        ...form.getHeaders(),
      },
    });

    res.json({ link: response.data.data.link });
  } catch (error) {
    console.error("Error uploading image to Imgur:", error.message);
    res.status(500).json({ error: error.message });
  }
});

let mongoose = require("mongoose");
const { type } = require("os");
mongoose.connect("mongodb://127.0.0.1:27017/SocialNetwork");

let userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    admin: {
      type: Boolean,
      required: false,
    },
    phonenumber: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: false,
    },
    age: {
      type: Number,
      required: false,
    },
    hobbi: {
      type: String,
      required: false,
    },
    education: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: false,
    },
    Premium: {
      type: Boolean,
      default: false,
    },
    paymentId: String,
    friends: [
      {
        email: String,
        lastMessage: {
          from: String,
          to: String,
          text: String,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      },
    ],
    socketid: {
      type: Array,
      required: false,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

let User = mongoose.model("user", userSchema);

let postSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: false,
    },
    text: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

let Post = mongoose.model("post", postSchema);

let advertisementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: false,
    },
    link: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

let Advertisement = mongoose.model("advertisement", advertisementSchema);

let messageSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

let Message = mongoose.model("message", messageSchema);

app.get("/getUsers", async function (req, res) {
  try {
    let email = req.query.email;
    let data = await User.find({ email: { $ne: email } }).sort({
      full_name: 1,
    });
    res.send(data);
  } catch {
    console.error(505);
  }
});

app.get("/getAdvertisements", async function (req, res) {
  try {
    let data = await Advertisement.find();
    res.send(data);
  } catch {
    console.error(404);
  }
});

app.post("/postAdvertisement", async function (req, res) {
  try {
    let text = req.body.text;
    let img = req.body.img;
    let title = req.body.title;
    let link = req.body.link;

    let advertisement = new Advertisement({
      title: title,
      text: text,
      img: img,
      link: link,
    });
    await advertisement.save();
    let data = await Advertisement.find();
    res.send(data);
  } catch {
    console.error(404);
  }
});

app.get("/getContactByNick", async function (req, res) {
  try {
    let username = req.query.username;
    let data = await User.find({ full_name: username });
    res.send(data);
  } catch {
    console.error(505);
  }
});

app.post(`/removeFriend`, async function (req, res) {
  let removeEmail = req.body.removeEmail;
  let email = req.body.useremail;
  try {
    let user = await User.findOne({ email: email });
    user.friends = user.friends.filter(
      (friend) => friend.email !== removeEmail
    );
    await user.save();
    res.send(user);
  } catch {
    console.error(505);
  }
});

// Обработка WebSocket соединений
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("userConnect", async (data) => {
    let email = data.emailforsocket;
    console.log("Received userConnect event with email:", email);
    try {
      let user = await User.findOne({ email: email });
      if (user) {
        user.socketid.push({ id: socket.id });
        await user.save();
        console.log(`User ${email} updated with socket ID: ${socket.id}`);
      }
    } catch (error) {
      console.error("Error saving socket ID:", error);
    }
  });

  socket.on("sendMessage", async (data) => {
    if ((data.from, data.to, data.text)) {
      let message = new Message({
        from: data.from,
        to: data.to,
        text: data.text,
      });
      await message.save();
      try {
        await User.updateOne(
          { email: data.from, "friends.email": data.to },
          { $set: { "friends.$.lastMessage": message } }
        );
        await User.updateOne(
          { email: data.to, "friends.email": data.from },
          { $set: { "friends.$.lastMessage": message } }
        );
      } catch (error) {
        console.error(error);
      }
      const sender = await User.findOne({ email: data.from });
      if (sender) {
        sender.socketid.forEach((id) => {
          io.to(id.id).emit("newMessage", { message });
        });
      }
      let senderFullname = sender.full_name;
      let senderImg = sender.img;
      let senderInfo = { senderFullname, senderImg };
      const recipient = await User.findOne({ email: data.to });
      if (recipient) {
        recipient.socketid.forEach((id) => {
          io.to(id.id).emit("newMessage", { message, senderInfo });
        });
      }
      console.log("все успешно");
    } else {
      res.console.error(404);
    }
  });

  socket.on("userDisconnect", async (data) => {
    let email = data.emailforsocket;
    try {
      let user = await User.findOne({ email: email });
      if (user) {
        user.socketid = user.socketid.filter((item) => item.id !== socket.id);
        await user.save();
        console.log(`User ${email} deleted with socket ID: ${socket.id}`);
      }
    } catch (error) {
      console.error("Error deleted socket ID:", error);
    }
  });
});

app.get(`/getposts`, async function (req, res) {
  try {
    let data = await Post.find();
    res.send(data);
  } catch {
    console.error(404);
  }
});
app.post(`/post`, async function (req, res) {
  try {
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let img = req.body.img;
    let text = req.body.text;
    let avatar = req.body.avatar;
    let email = req.body.email;

    let post = new Post({
      first_name: first_name,
      last_name: last_name,
      img: img,
      text: text,
      avatar: avatar,
      email: email,
    });
    await post.save();
    let data = await Post.find();
    res.send(data);
  } catch {
    console.error(404);
  }
});

app.post(`/register`, async function (req, res) {
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let full_name = req.body.full_name;
  let phonenumber = req.body.phonenumber;
  let email = req.body.email;
  let password = req.body.password;
  try {
    let user = new User({
      first_name: first_name,
      last_name: last_name,
      full_name: full_name,
      phonenumber: phonenumber,
      email: email,
      password: password,
    });
    await user.save();
    res.send(user);
  } catch {
    console.error("Ошибка регистрации");
  }
});

app.get("/getAllContacts", async (req, res) => {
  try {
    const email = req.query.email;
    let user = await User.findOne({ email: email });
    const friendsEmails = user.friends.map((friend) => friend.email);
    const friends = await User.find({ email: { $in: friendsEmails } });
    const friendsWithLastMessages = friends.map((friend) => {
      const friendInfo = user.friends.find((f) => f.email === friend.email);
      return {
        ...friend.toObject(),
        lastMessage: friendInfo ? friendInfo.lastMessage : null,
      };
    });
    friendsWithLastMessages.sort((a, b) => {
      const getDate = (message) => {
        return message && message.createdAt
          ? new Date(message.createdAt)
          : new Date(0);
      };
      const dateA = getDate(a.lastMessage);
      const dateB = getDate(b.lastMessage);
      return dateB - dateA; // От большего к меньшему
    });
    if (friendsWithLastMessages) {
      res.send(friendsWithLastMessages);
    } else {
      console.error(505);
    }
  } catch {
    console.error(404);
  }
});

app.get("/joinChat", async (req, res) => {
  try {
    let to = req.query.to;
    let user = await User.findOne({ email: to });
    res.send(user);
  } catch {
    console.error(505);
  }
});

app.get("/getMessages", async (req, res) => {
  try {
    let to = req.query.to;
    let from = req.query.from;
    let messages = await Message.find({
      $or: [
        { from: from, to: to },
        { from: to, to: from },
      ],
    }).sort({ timestamps: -1 });
    res.send(messages);
  } catch {
    console.error(404);
  }
});
app.put("/update", async (req, res) => {
  try {
    const newUser = req.body;
    await User.findOneAndReplace({ email: newUser.email }, newUser, {
      new: true,
      upsert: true,
    });
  } catch {
    console.error(505);
  }
});

app.put("/addContact", async (req, res) => {
  const useremail = req.body.useremail;
  const contactemail = req.body.contactemail;
  try {
    let user = await User.findOne({ email: useremail });
    user.friends.push({ email: contactemail });
    await user.save();
    let data = user.friends;
    res.send(data);
  } catch {
    console.error(505);
  }
});

app.get(`/login`, async function (req, res) {
  try {
    let email = req.query.email;
    let password = req.query.password;
    let data = await User.findOne({ email: email });
    if ((data.password = password)) {
      res.send(data);
    } else {
      console.error("Неправильный пароль!");
    }
  } catch {
    console.error("Ошибка в поиске пользователя!");
  }
});

app.get("/LoginUser", async function (req, res) {
  try {
    let email = req.query.email;
    let user = await User.findOne({ email: email });
    if (user) {
      res.send(user);
    } else {
      console.error(505);
    }
  } catch {
    console.error(404);
  }
});

app.get(`/getUser`, async function (req, res) {
  const email = req.query.email;
  let data = await User.findOne({ email: email });
  res.send(data);
});

app.get("/getCode", async (req, res) => {
  let to = req.query.to;
  try {
    // Create a transporter
    let transporter = nodemailer.createTransport({
      host: "smtp.mail.ru",
      port: 465, // Можно использовать 587 для STARTTLS
      secure: true,
      auth: {
        user: "broykznetwork@internet.ru",
        pass: "dG36kDmhjE3PYg5V4cLS",
      },
    });
    let one = Math.round(Math.random() * (9 - 0));
    let two = Math.round(Math.random() * (9 - 0));
    let three = Math.round(Math.random() * (9 - 0));
    let four = Math.round(Math.random() * (9 - 0));
    let code = `${one}${two}${three}${four}`;
    await transporter.sendMail({
      from: "broykznetwork@internet.ru",
      to: to,
      subject: "Проверочный код для регистрации",
      html: `<h2 style="font-weight: normal">Ваш проверочный код <b style="font-weight: bold"> ${code}</b>! Если вы не регистрировали аккаунт на Social Network , то напишите нам в поддержку! </h2>`,
    });
    res.send(code);
  } catch {
    res.send.status(404);
  }
});

const SHOP_ID = "415999";
const SECRET_KEY = "test_07i1UsEEoJn_g_SIh-vYmiJDKGZ1Oksy3dMrNfXU0cw";
const RETURN_URL = "http://localhost:5173/payment-success";

app.post("/create-payment", async (req, res) => {
  const { email } = req.body;
  const idempotenceKey = crypto.randomBytes(16).toString("hex");

  try {
    const response = await axios.post(
      "https://api.yookassa.ru/v3/payments",
      {
        amount: {
          value: 499,
          currency: "RUB",
        },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: RETURN_URL,
        },
        description: "Оплата премиума",
        metadata: {
          email: email
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Idempotence-Key": idempotenceKey,
        },
        auth: {
          username: SHOP_ID,
          password: SECRET_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/webhook", async (req, res) => {
  const { event, object } = req.body;
  if (event === 'payment.succeeded') {
    const email = object.metadata.email;
    try {
      await User.findOneAndUpdate({ email }, { Premium: true });
    } catch (error) {
      console.log(error);
    }
  }
  res.status(200).send('OK');
});

server.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
});
