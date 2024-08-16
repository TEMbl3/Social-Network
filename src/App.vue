// Привет
<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import axios from 'axios';
import VueCookies from 'vue-cookies';
import io from 'socket.io-client';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru')

const socket = io("http://localhost:3000");
const chatContainer = ref(null);
const imageFile = ref(null);
const first_name = ref('');
const last_name = ref('');
const email = ref('');
const password = ref('');
const reglog = ref(false)
const auntification = ref(false)
const phonenumber = ref('')
const loading = ref(false)
const authorized = ref(false)
const user = ref([])
const hidden = ref(false)
const darkmode = ref(false)
const redactor = ref(false)
const profile = ref(true)
const news = ref(false)
const friendstoggle = ref(false)
const posts = ref([])
const postimg = ref('')
const text = ref('')
const adminPanel = ref(false)
const myPosts = ref([])
const allUsers = ref([])
const currentUser = ref([])
const currentUserPosts = ref([])
const poiskOpen = ref(false)
const poiskusers = ref([])
const poiskusername = ref('')
const messenger = ref(false)
const allContacts = ref([])
const recipient = ref([])
const MessageText = ref('')
const messages = ref([])
const notification = ref([])
const checkCode = ref(null)
const errorCheckCode = ref(false)
const advertisements = ref([])
const OpenCheckEmail = ref(false)
const inputValues = ref(['', '', '', '']);
const errorRegister = ref(false)
const textAdvertisement = ref('')
const imgAdvertisement = ref('')
const titleAdvertisement = ref('')
const linkAdvertisement = ref('')
const openPostAdvertisement = ref(false)

const handleInput = (index) => {
  const value = inputValues.value[index];
  if (index < inputValues.value.length - 1 && value) {
    document.querySelectorAll('.input-box')[index + 1].focus();
  } else if (index > 0 && !value) {
    document.querySelectorAll('.input-box')[index - 1].focus();
  }
};

const checkValue = () => {
  const enteredValue = inputValues.value.join('');
  console.log(enteredValue, checkCode.value);

  if (enteredValue === String(checkCode.value)) {
    register()
  } else {
    errorCheckCode.value = true
  }
};


const getUsers = async () => {
  let response = await axios.get(`http://localhost:3000/getUsers`, {
    params: {
      email: user.value.email
    }
  })
  allUsers.value = response.data
}
const getCode = async () => {
  if (first_name.value, last_name.value, phonenumber.value, email.value, password.value) {
    OpenCheckEmail.value = true
    let response = await axios.get('http://localhost:3000/getCode', {
      params: {
        to: email.value
      }
    })
    checkCode.value = response.data
  } else {
    errorRegister.value = true
  }
}
const getAllContacts = async () => {
  let response = await axios.get('http://localhost:3000/getAllContacts', {
    params: {
      email: user.value.email
    }
  })
  allContacts.value = response.data
}
const getMyPosts = () => {
  if (user.value && posts.value.length !== 0) {
    myPosts.value = posts.value.filter(post => post.email === user.value.email);
  } else {
    console.error('No posts to filter or user is null');
  }
};
const getAdvertisements = async () => {
  let response = await axios.get('http://localhost:3000/getAdvertisements')
  advertisements.value = response.data
}
const getPosts = async () => {
  try {
    let response = await axios.get('http://localhost:3000/getposts')
    posts.value = response.data
  } catch {
    console.error(404);
  }
}

const addFriend = async (email) => {
  try {
    let response = await axios.put('http://localhost:3000/addContact', {
      useremail: user.value.email,
      contactemail: email
    })
    user.value.friends = response.data
    VueCookies.remove('user')
    VueCookies.set('user', user.value.email, '30d')
  } catch {
    console.error(404);
  }
}
const removeFriend = async (email) => {
  if (email) {
    try {
      let response = await axios.post('http://localhost:3000/removeFriend', {
        removeEmail: email,
        useremail: user.value.email
      })
      user.value.friends = response.data.friends
      VueCookies.remove('user')
      VueCookies.set('user', user.value.email, '30d')
    } catch {
      console.error(404);
    }
  }
}
const getcurrentUserPosts = () => {
  if (currentUser.value && posts.value.length > 0) {
    currentUserPosts.value = posts.value.filter(post => post.email === currentUser.value.email);
  } else {
    console.error('No posts to filter or user is null');
  }
};
const getCurrentUser = async (email) => {
  try {
    let response = await axios.get('http://localhost:3000/getUser', {
      params: {
        email: email
      }
    })
    currentUser.value = response.data
    friendstoggle.value = false
    getcurrentUserPosts()
  } catch {
    console.error(505);
  }
}
const posting = async () => {
  try {
    let response = await axios.post('http://localhost:3000/post', {
      first_name: user.value.first_name,
      last_name: user.value.last_name,
      img: postimg.value,
      text: text.value,
      avatar: user.value.img,
      email: user.value.email
    })
    posts.value = response.data
    text.value = ''
    postimg.value = ''
    getMyPosts()
  } catch {
    console.error(404);
  }
}

const register = async () => {
  try {
    let full_name = first_name.value + ' ' + last_name.value
    let response = await axios.post('http://localhost:3000/register', {
      first_name: first_name.value,
      last_name: last_name.value,
      full_name: full_name,
      phonenumber: phonenumber.value,
      email: email.value,
      password: password.value
    });
    getPosts()
    user.value = response.data
    getMyPosts()
    console.log("Пользователь зарегистрирован")
    let emailforsocket = user.value.email
    socket.emit('userConnect', { emailforsocket });
    authorized.value = true
    VueCookies.set('user', user.value.email, '30d')

  } catch {
    console.error('Ошибка регистрации')
  }
}
const formattedDate = (date) => {
  const today = dayjs();
  const inputDate = dayjs(date);
  const yearToday = today.year();
  const monthToday = today.month();
  const dayToday = today.date();

  const yearDate = inputDate.year();
  const monthDate = inputDate.month();
  const dayDate = inputDate.date();

  if (yearToday === yearDate) {
    if (monthToday === monthDate) {
      if (dayToday === dayDate) {
        return inputDate.format('Сегодня в H:mm');
      } else {
        return inputDate.format('D MMMM в H:mm');
      }
    }
    else {
      return inputDate.format('DD MMMM');
    }
  }
  else {
    return inputDate.format('DD MMMM YYYY');
  }
};

const updateUser = async () => {
  try {
    user.value.full_name = user.value.first_name + ' ' + user.value.last_name
    console.log();
    await axios.put(`http://localhost:3000/update`, user.value,
      VueCookies.remove('user'),
      VueCookies.set('user', user.value.email, '30d'),
      console.log('User updated'))
  } catch {
    console.error('Ошибка в редактирование профиля');
  }
}

const quit = () => {
  VueCookies.remove('user')
  window.location.reload();
}

const login = async () => {
  try {
    let { data } = await axios.get('http://localhost:3000/login', {
      params: {
        email: email.value,
        password: password.value
      }
    })
    getPosts()
    user.value = data
    setTimeout(getMyPosts(), 0)
    authorized.value = true
    VueCookies.set('user', user.value.email, '30d');
    let emailforsocket = user.value.email
    socket.emit('userConnect', { emailforsocket });
  } catch {
    сonsole.error('Ошибка авторизации!')
  }
}

const onFileChange = (event) => {
  imageFile.value = event.target.files[0];
  uploadImage();
};

const getContactByNick = async () => {
  if (poiskusername.value) {
    let response = await axios.get('http://localhost:3000/getContactByNick', {
      params: {
        username: poiskusername.value
      }
    })
    poiskOpen.value = true
    poiskusers.value = response.data
  } if (!poiskusername.value) {
    poiskOpen.value = false
    poiskusers.value = null
  }
}

const uploadImage = async () => {
  if (!imageFile.value) return;
  loading.value = true
  const formData = new FormData();
  formData.append('image', imageFile.value);

  try {
    const response = await axios.post('http://localhost:3000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    user.value.img = response.data.link;
    loading.value = false
  } catch (error) {
    console.error('Error uploading image:', error);
    loading.value = false
  }
};

const onPostChange = (event) => {
  imageFile.value = event.target.files[0];
  uploadPostImage();
};

const uploadPostImage = async () => {
  if (!imageFile.value) return;
  loading.value = true
  const formData = new FormData();
  formData.append('image', imageFile.value);

  try {
    const response = await axios.post('http://localhost:3000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    postimg.value = response.data.link;
    loading.value = false
  } catch (error) {
    console.error('Error uploading image:', error);
    loading.value = false
  }
}
const onAdvertisementChange = (event) => {
  imageFile.value = event.target.files[0];
  uploadAdvertisementImage();
};

const uploadAdvertisementImage = async () => {
  if (!imageFile.value) return;
  loading.value = true
  const formData = new FormData();
  formData.append('image', imageFile.value);

  try {
    const response = await axios.post('http://localhost:3000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    imgAdvertisement.value = response.data.link;
    loading.value = false
  } catch (error) {
    console.error('Error uploading image:', error);
    loading.value = false
  }
}

const join = async () => {
  try {
    const savedUser = VueCookies.get('user')
    if (savedUser) {
      let response = await axios.get('http://localhost:3000/LoginUser', {
        params: {
          email: savedUser
        }
      })
      console.log(response.data);

      getPosts()
      user.value = response.data
      getMyPosts()
      let emailforsocket = savedUser
      socket.emit('userConnect', { emailforsocket });
      authorized.value = true
    } else {
      auntification.value = true
    }
  } catch {
    console.error(404);
  }

}
const postAdvertisement = async () => {
  let response = await axios.post('http://localhost:3000/postAdvertisement', {
    text: textAdvertisement.value,
    img: imgAdvertisement.value,
    title: titleAdvertisement.value,
    link: linkAdvertisement.value
  })
  advertisements.value = response.data
  openPostAdvertisement.value = false
  textAdvertisement.value = ''
  imgAdvertisement.value = ''
  titleAdvertisement.value = ''
  linkAdvertisement.value = ''
}
const sendMessage = (email) => {
  let message = {
    from: user.value.email,
    to: email,
    text: MessageText.value
  }
  try {
    socket.emit('sendMessage', message)
  } catch {
    console.error(404);
  }
}
const isFriend = (email) => {
  return user.value.friends.some(friend => friend.email === email)
}

const clearCurrentUser = () => {
  currentUser.value = ''
}

const joinChat = async (email) => {
  let response = await axios.get('http://localhost:3000/joinChat', {
    params: {
      to: email,
      from: user.value.email
    }
  })
  let secondresponse = await axios.get('http://localhost:3000/getMessages', {
    params: {
      to: email,
      from: user.value.email
    }
  })
  recipient.value = response.data
  messages.value = secondresponse.data
  await nextTick();
  // Отложенная прокрутка на следующем тик
  setTimeout(() => scrollToBottom(), 0);
}
function scrollToBottom() {
  console.log(chatContainer.value.scrollHeight);
  chatContainer.value.scrollTop = chatContainer.value.scrollHeight
}
const clearRecipient = () => {
  recipient.value = []
  messenger.value = true
  MessageText.value = ''
}
socket.on('newMessage', async (data) => {
  if (data.from = recipient.value.email) {
    let message = data.message
    messages.value.push(message)
    await nextTick()
    scrollToBottom();
  } else if (messenger.value && recipient.value.length === 0) {
    let message = data.message
    if (user.value.email === message.to) {
      notification.value = data
    }
    getAllContacts()
  } else {
    let message = data.message
    if (user.value.email === message.to) {
      notification.value = data
    }
  }
})
const openCurrenChat = (email) => {
  news.value = false
  profile.value = false
  friendstoggle.value = false
  messenger.value = true
  clearCurrentUser()
  joinChat(email)
  notification.value = []
}
watch(posts, (newPosts) => {
  if (newPosts.length > 0) {
    getMyPosts();
  }
});
onMounted(() => {
  join()
  getAdvertisements()
  window.addEventListener('beforeunload', () => {
    const emailforsocket = user.value.email;
    socket.emit('userDisconnect', { emailforsocket });
  });
}
)
</script>

<template>
  <transition name="slide-fade">
    <div
      class="fixed right-10 bottom-10 w-[400px] max-w-[400px] h-28 border flex items-center gap-3 max-h-28 rounded-xl shadow-md flex z-10 bg-white"
      v-if="notification.length !== 0">
      <img :src="notification.senderInfo.senderImg" v-if="notification.senderInfo.senderImg"
        class="min-w-14 ml-5 w-14 max-w-14 h-14 max-h-14 min-h-14 rounded-[50%] object-cover" alt="">
      <img
        src="https://sun9-35.userapi.com/impg/c631928/v631928758/3aa12/0EZXEZFWjdk.jpg?size=2048x1290&quality=96&sign=8792eb719c13ec61472567a369d495e0&c_uniq_tag=USF1lxcERr7UoKbXZUbIGRucbdlF0F4_eYju_-22KH0&type=album"
        v-else class="min-w-14 ml-5 w-14 max-w-14 h-14 max-h-14 min-h-14 rounded-[50%] object-cover" alt="">
      <div class="flex gap-[8px] flex-col">
        <h2 class="text-lg font-semibold">{{ notification.senderInfo.senderFullname }}</h2>
        <h3 class="text-gray-500 w-48 max-w-48 overflow-hidden overflow-ellipsis ">{{ notification.message.text }}</h3>
      </div>
      <div class="border-l cursor-pointer w-full text-center h-full  rounded-r-xl select-none text-lg">
        <div class="flex flex-col">
          <span @click="openCurrenChat(notification.message.from)"
            class="w-full border-b min-h-14 flex items-center justify-center text-blue-600 hover:bg-slate-100 active:bg-slate-200 transition">Ответить</span>
          <span @click="notification = []"
            class="w-full min-h-14 flex items-center text-gray-500 justify-center pb-1 hover:bg-slate-100 active:bg-slate-200 transition">Закрыть</span>
        </div>
      </div>
    </div>
  </transition>
  <div v-if="auntification">
    <div v-if="!authorized & !reglog & !OpenCheckEmail"
      class="flex flex-col gap-3 w-full h-screen justify-center items-center">
      <h2 class="text-2xl mb-2 font-bold">Регистрация</h2>
      <input class="border w-96 rounded-lg p-2 px-3" type="text" v-model="first_name" placeholder="Имя">
      <input class="border w-96 rounded-lg p-2 px-3" type="text" v-model="last_name" placeholder="Фамилия">
      <input class="border w-96 rounded-lg p-2 px-3" type="text" v-model="phonenumber" placeholder="+7-777-777-77-77">
      <input class="border w-96 rounded-lg p-2 px-3" type="email" v-model="email" placeholder="email@email.com">
      <input class="border w-96 rounded-lg p-2 px-3" type="password" v-model="password" placeholder="пароль">
      <button @click="getCode()"
        class="w-96 text-white  rounded-xl p-3 bg-blue-500 shadow hover:bg-blue-600 active:bg-blue-700 transition">Зарегистрироваться</button>
      <h2 v-if="errorRegister" class="text-red-500 text-lg font-semibold">Проверьте все-ли вы коректно ввели!</h2>
      <h2 v-else class="text-lg">Если у вас уже есть аккаунт, то <a @click="reglog = true"
          class="text-sky-600 cursor-pointer">войдите в
          него</a>!</h2>
    </div>
    <div v-if="!authorized & OpenCheckEmail"
      class="flex CheckEmail flex-col gap-4 w-full h-screen justify-center items-center">
      <img src="../public/cyborg-letter-f.png" class="w-24 mb-4" alt="">
      <h2 class="text-3xl font-semibold mb-3">Ваш проверочный код отправлен на вашу почту!</h2>
      <div class="input-container">
        <input v-for="(value, index) in inputValues" :key="index" class="input-box" type="text" maxlength="1"
          v-model="inputValues[index]" @input="handleInput(index)" />
      </div>
      <button @click="checkValue">Зарегистрироваться</button>
      <h3 v-if="errorCheckCode" class="-mt-3 text-center w-[450px] text-xl text-red-500 "><span
          class="font-semibold">Неверный код!</span></h3>
    </div>
    <div v-if="!authorized & reglog" class="flex flex-col gap-3 w-full h-screen justify-center items-center">
      <h2 class="text-2xl mb-2 font-bold">Авторизация</h2>
      <input class="border w-96 rounded-lg p-2 px-3" type="text" v-model="email" placeholder="Введите почту">
      <input class="border w-96 rounded-lg p-2 px-3" type="password" v-model="password" placeholder="Введите пароль">
      <button @click="login"
        class="w-96 rounded-xl text-white p-3 bg-blue-500 shadow hover:bg-blue-600 active:bg-blue-700 transition">Войти</button>
      <h2 class="text-lg">Если у вас нет аккаунта, <a @click="reglog = false"
          class="text-sky-600 cursor-pointer">зарегистрируйтесь</a>!
      </h2>
    </div>
  </div>
  <div class="w-full h-screen flex" v-if="authorized">
    <div :class="{ hide: !hidden, show: hidden, darkmode: darkmode }"
      class="gap-[40px] fixed z-10 h-screen bg-[#4f46e5] flex flex-col">
      <div class="flex mt-4 gap-4 items-center text-white">
        <div class="ml-[30px] py-2">
          <div @click="hidden = !hidden" class="burger-menu" :class="{ open: hidden }" id="burger-menu">
            <div class="line1"></div>
            <div class="line2"></div>
            <div class="line3"></div>
          </div>
        </div>
        <h2 class="text-2xl whitespace-nowrap -mt-1" v-if="hidden">Social Network</h2>
      </div>
      <div class="gap-[27px] flex group whitespace-nowrap text-white flex-col text-lg ml-[25px]">
        <div
          @click="news = false, profile = true, friendstoggle = false, messenger = false, adminPanel = false, clearCurrentUser(), openPostAdvertisement = false"
          class="flex gap-[20px] items-center opacity-70 hover:opacity-100" :class="{ activedashboard: profile }">
          <img v-if="!user.img" class="h-10 object-cover"
            src="https://img.icons8.com/?size=100&id=XOn9u5ajbq8a&format=png&color=FFFFFF" alt="">
          <img v-else class="h-10 rounded-3xl min-w-10 max-w-10 object-cover" :src="user.img" alt="">
          <button v-if="hidden" class="text-xl">Личный профиль</button>
        </div>
        <div
          @click="news = true, profile = false, friendstoggle = false, messenger = false, adminPanel = false, clearCurrentUser(), openPostAdvertisement = false"
          class="flex gap-[20px] items-center opacity-70 hover:opacity-100" :class="{ activedashboard: news }">
          <img class="h-10 object-cover" src="https://img.icons8.com/?size=100&id=59847&format=png&color=FFFFFF" alt="">
          <button v-if="hidden" class="text-xl">Новости</button>
        </div>
        <div
          @click="news = false, profile = false, friendstoggle = true, messenger = false, adminPanel = false, getUsers(), clearCurrentUser(), openPostAdvertisement = false"
          class="flex gap-[20px] items-center opacity-70 hover:opacity-100" :class="{ activedashboard: friendstoggle }">
          <img class="h-10 object-cover " src="https://img.icons8.com/?size=100&id=46204&format=png&color=FFFFFF"
            alt="">
          <button v-if="hidden" class="text-xl">Друзья</button>
        </div>
        <div
          @click="news = false, profile = false, friendstoggle = false, messenger = true, adminPanel = false, getAllContacts(), clearCurrentUser(), openPostAdvertisement = false"
          class="flex gap-[20px] items-center opacity-70 hover:opacity-100" :class="{ activedashboard: messenger }">
          <img class="h-10 object-cover " src="https://img.icons8.com/?size=100&id=118377&format=png&color=FFFFFF"
            alt="">
          <button v-if="hidden" class="text-xl">Сообщения</button>
        </div>
        <div v-if="user.admin"
          @click="news = false, profile = false, friendstoggle = false, messenger = false, adminPanel = true, getAdvertisements(), clearCurrentUser(), openPostAdvertisement = false"
          class="flex gap-[20px] items-center opacity-70 hover:opacity-100" :class="{ activedashboard: adminPanel }">
          <img class="h-10 object-cover " src="https://img.icons8.com/?size=100&id=aQlRLcL6h4Ro&format=png&color=FFFFFF"
            alt="">
          <button v-if="hidden" class="text-xl">Админ панель</button>
        </div>
      </div>
      <div @click="quit(), clearCurrentUser()"
        class="flex gap-[20px] whitespace-nowrap mt-auto mb-10 ml-[32px] text-white items-center opacity-70 hover:opacity-100">
        <img class="h-8 object-cover" src="https://img.icons8.com/?size=100&id=2445&format=png&color=FFFFFF" alt="">
        <button v-if="hidden" class="text-xl">Выйти с аккаунта</button>
      </div>
    </div>
    <div class="z-3 w-full h-screen flex gap-36 pt-20" :class="{ profileopen: hidden, profileclose: !hidden }"
      v-if="profile">
      <div class="flex flex-col w-96 ">
        <img class="h-96  w-[340px] mx-auto object-cover mb-2 border-1 border-blue-700" v-if="!user.img"
          src="https://sun9-35.userapi.com/impg/c631928/v631928758/3aa12/0EZXEZFWjdk.jpg?size=2048x1290&quality=96&sign=8792eb719c13ec61472567a369d495e0&c_uniq_tag=USF1lxcERr7UoKbXZUbIGRucbdlF0F4_eYju_-22KH0&type=album"
          alt="">
        <img class="h-96 shadow w-[340px] mx-auto object-cover mb-2 border-1 border-blue-700" v-if="user.img"
          :src="user.img" alt="">
        <h2 class="text-3xl font-bold border-b-2 py-1 pb-2 border-blue-500 text-center">{{ user.first_name }} {{
          user.last_name }}</h2>
        <div class="flex flex-wrap flex-col items-left mt-3 break-all  w-96">
          <h3 class="font-medium mb-2 text-xl text-overflow: ellipsis;">Статус: <span v-if="user.status"
              class="font-normal">{{
                user.status }}</span><a v-if="!user.status" class="font-normal cursor-pointer text-blue-600"
              @click="redactor = !redactor">добавить</a></h3>
          <h3 class="mb-2 font-medium text-xl">Возраст: <span v-if="user.age" class="font-normal">{{ user.age
              }}</span><a v-if="!user.age" class="font-normal text-blue-600 cursor-pointer"
              @click="redactor = !redactor">добавить</a></h3>
          <h3 class="mb-2 font-medium text-xl">Хобби: <span v-if="user.hobbi" class="font-normal">{{ user.hobbi
              }}</span><a v-if="!user.hobbi" class="font-normal text-blue-600 cursor-pointer"
              @click="redactor = !redactor">добавить</a></h3>
          <h3 class="font-medium text-xl ">Где учился: <span v-if="user.education" class="font-normal">{{
            user.education }}</span><a v-if="!user.education" class="font-normal cursor-pointer text-blue-600"
              @click="redactor = !redactor">добавить</a></h3>
          <button @click="redactor = !redactor"
            class="text-xl shadow p-3 text-white mt-3 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700">Редактировать
            профиль</button>
        </div>
      </div>
      <div class="flex flex-col w-[600px] gap-[13px]" v-if="redactor">
        <input type="text" class="border p-3 rounded-lg" placeholder="Имя" v-model="user.first_name">
        <input type="text" class="border p-3 rounded-lg" placeholder="Фамилия" v-model="user.last_name">
        <div class="flex border p-3 rounded-lg items-center gap-3 whitespace-nowrap">
          <label for="upload-photo" v-if="!loading">Нажмите для загрзки аватарки</label>
          <label for="upload-photo" class="flex items-center gap-3" v-else>
            <div class="spinner-border text-primary" role="status" />
            <span>Загрузка...</span>
          </label>
          <input @change="onFileChange" id="upload-photo" type="file" class="d-none w-full " placeholder="Фото профиля">
        </div>
        <input type="text" class="border p-3 rounded-lg" placeholder="+7-777-777-77-77" v-model="user.phonenumber">
        <input type="text" class="border p-3 rounded-lg" placeholder="Возраст" v-model="user.age">
        <input type="text" class="border p-3 rounded-lg" placeholder="Хобби" v-model="user.hobbi">
        <input type="text" class="border p-3 rounded-lg" placeholder="Где учился?" v-model="user.education">
        <input type="text" class="border p-3 rounded-lg" placeholder="Статус" v-model="user.status">
        <button @click="updateUser"
          class="text-xl p-3 text-white mt-1 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 shadow">Сохранить</button>
      </div>
      <div class="flex flex-col gap-5">
        <div class="border-1 rounded-xl mx-auto gap-3 h-20 p-3 flex shadow-md" v-if="!redactor">
          <img v-if="user.img" :src="user.img" class="w-10 h-10 object-cover rounded-3xl" alt="">
          <img v-else
            src="https://sun9-35.userapi.com/impg/c631928/v631928758/3aa12/0EZXEZFWjdk.jpg?size=2048x1290&quality=96&sign=8792eb719c13ec61472567a369d495e0&c_uniq_tag=USF1lxcERr7UoKbXZUbIGRucbdlF0F4_eYju_-22KH0&type=album"
            class="w-10 h-10 object-cover rounded-3xl" alt="">
          <input class="border rounded w-96 p-1 px-2" type="text" v-model="text" placeholder="Что у вас нового?">
          <input @change="onPostChange" class="hidden" id="loadpostphoto" type="file">
          <div class="flex items-center gap-3">
            <label for="loadpostphoto">
              <img class="w-10 h-10" src="https://img.icons8.com/?size=100&id=111341&format=png&color=1A1A1A" alt="">
            </label>
            <div class="flex items-center gap-3" v-if="loading">
              <div class="spinner-border text-primary" role="status" />
              <span>Загрузка...</span>
            </div>
          </div>
          <button @click="posting"
            class="p-2 rounded shadow-md bg-blue-500 hover:bg-blue-600 active:bg-blue-800 transition text-white border">Опубликовать</button>
        </div>
        <div class="mx-auto w-[650px] flex-col-reverse flex" v-if="!redactor && myPosts.length > 0">
          <div class="text-left w-full border mb-4 rounded-xl p-4 shadow-md" v-if="myPosts.length > 0"
            v-for="post in myPosts">
            <div class="flex items-center gap-3 my-3 ml-3 justify-between">
              <div class="flex items-center gap-3">
                <img class="w-10 h-10 object-cover rounded-3xl" :src="post.avatar" alt="">
                <h2 class="text-xl">{{ post.first_name }} {{ post.last_name }}</h2>
              </div>
              <p>{{ formattedDate(post.createdAt) }}</p>
            </div>
            <p class="my-4 ml-3">{{ post.text }}</p>
            <img v-if="post.img" class="w-full border rounded bg-gray-100 max-h-[600px] object-contain" :src="post.img"
              alt="">
          </div>
        </div>
        <div class="flex flex-col" v-if="myPosts.length == 0 && !redactor">
          <div class="mx-auto w-[670px]">
            <div class="text-left w-full border mb-4 rounded-xl  pb-4 shadow-md flex flex-col">
              <h2 class="text-center text-2xl leading-9 bg-sky-50 rounded-xl p-[25px]">К сожалению у <span
                  class="font-bold">{{ user.first_name }}(а)
                  {{ user.last_name }}(а)</span> пока нет постов! 😭</h2>
              <hr>
              <img class="mx-52 my-5 object-cover" src="../public/kit-social-media-post.png" alt="">
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="z-3 w-full h-screen flex ml-[28%] pt-12" v-if="news">
      <div class="flex flex-col gap-5">
        <div class="border-1 mx-auto rounded-xl gap-3 p-3 flex shadow-md">
          <img v-if="user.img" :src="user.img" class="w-10 h-10 object-cover rounded-3xl" alt="">
          <img v-else
            src="https://sun9-35.userapi.com/impg/c631928/v631928758/3aa12/0EZXEZFWjdk.jpg?size=2048x1290&quality=96&sign=8792eb719c13ec61472567a369d495e0&c_uniq_tag=USF1lxcERr7UoKbXZUbIGRucbdlF0F4_eYju_-22KH0&type=album"
            class="w-10 h-10 object-cover rounded-3xl" alt="">
          <input v-model="text" class="border rounded w-96 p-1 px-2" type="text" placeholder="Что у вас нового?">
          <input @change="onPostChange" class="hidden" id="loadpostphoto" type="file">
          <div class="flex items-center gap-3">
            <label for="loadpostphoto">
              <img class="w-10 h-10" src="https://img.icons8.com/?size=100&id=111341&format=png&color=1A1A1A" alt="">
            </label>
            <div class="flex items-center gap-3" v-if="loading">
              <div class="spinner-border text-primary" role="status" />
              <span>Загрузка...</span>
            </div>
          </div>
          <button @click="posting"
            class="p-2 rounded bg-blue-500 hover:bg-blue-600 active:bg-blue-800 transition text-white border">Опубликовать</button>
        </div>
        <div class="mx-auto w-[750px] flex-col-reverse flex">
          <div class="text-left w-full border mb-4 rounded-xl p-4 shadow-md" v-for="post in posts">
            <div class="flex items-center gap-3 my-3 ml-3 justify-between">
              <div class="flex items-center gap-3">
                <img loading="lazy" class="w-10 h-10 object-cover rounded-3xl" :src="post.avatar" alt="">
                <h2 class="text-xl">{{ post.first_name }} {{ post.last_name }}</h2>
              </div>
              <p>{{ formattedDate(post.createdAt) }}</p>
            </div>
            <p class="my-4 ml-3">{{ post.text }}</p>
            <img loading="lazy" v-if="post.img" class="w-full border rounded bg-gray-100 max-h-[600px] object-contain"
              :src="post.img" alt="">
          </div>
        </div>
      </div>
      <div class="flex-col mt-32 ml-10 flex gap-4">
        <div class="border w-80 max-w-80 h-auto flex flex-col gap-2 p-3 rounded-lg shadow-sm" v-for="advertisement in advertisements">
          <img v-if="advertisement.img" class="rounded mb-2 max-w-full object-cover max-h-64" :src="advertisement.img" alt="">
          <a target="_blank" :href="advertisement.link">
            <h2 class="text-xl text-blue-600 hover:text-blue-800 font-semibold break-all">{{advertisement.title}}</h2>
          </a>
          <p class="break-all">{{ advertisement.text }}</p>
          <a target="_blank" :href="advertisement.link"
            class="bg-blue-500 text-center hover:bg-blue-600 active:bg-blue-700 transition pointer text-white py-2 rounded">Перейти на товар</a>
        </div>
      </div>
    </div>
    <div class="z-3 w-full h-screen pt-12 overflow-y-scroll pb-12" v-if="friendstoggle">
      <div class="p-5 border mx-auto rounded-xl w-[750px]" v-if="user.friends.length == 0 && !poiskOpen">
        <div class="flex flex-col gap-3">
          <div class="flex items-center">
            <input type="text" class="w-full border p-3 rounded-l-lg focus:outline-none" v-model="poiskusername"
              placeholder="Поиск друзей">
            <button
              class="border-r border-b rounded-r-lg bg-blue-500 text-white p-3 hover:bg-blue-600 active:bg-blue-700 transition"
              @click="getContactByNick">Поиск</button>
          </div>
          <div v-for="friend in allUsers">
            <div class="rounded-lg p-4 flex items-center border justify-between">
              <div class="gap-3 flex items-center">
                <img v-if="friend.img" :src="friend.img" class="w-24 h-24 object-cover rounded-[50%]" alt="">
                <img v-else
                  src="https://sun9-35.userapi.com/impg/c631928/v631928758/3aa12/0EZXEZFWjdk.jpg?size=2048x1290&quality=96&sign=8792eb719c13ec61472567a369d495e0&c_uniq_tag=USF1lxcERr7UoKbXZUbIGRucbdlF0F4_eYju_-22KH0&type=album"
                  class="w-24 h-24 object-cover rounded-[50%]" alt="">
                <div class="flex flex-col">
                  <div @click="getCurrentUser(friend.email)"
                    class="text-xl cursor-pointer hover:text-blue-600 transition active:text-blue-700">
                    {{ friend.first_name }}
                    {{ friend.last_name }}

                  </div>
                  <p class="opacity-50" v-if="friend.education">{{ friend.education }}</p>
                  <a class="text-blue-500">Написать</a>
                </div>
              </div>
              <button @click="removeFriend(friend.email)" class="p-2 px-3 ml-24 text-white bg-gray-400 rounded-lg"
                v-if="isFriend(friend.email)">В
                контактах</button>
              <button @click="addFriend(friend.email)" class="p-2 ml-24 text-white bg-blue-500 rounded-lg"
                v-else>Добавить в
                контакты</button>
            </div>
          </div>
        </div>
      </div>
      <div class="p-5 border mx-auto rounded-xl w-[750px]" v-if="poiskOpen">
        <div class="flex flex-col gap-3">
          <div class="flex items-center">
            <input type="text" class="w-full border p-3 rounded-l-lg focus:outline-none" v-model="poiskusername"
              placeholder="Поиск друзей">
            <button
              class="border-r border-t border-b rounded-r-lg bg-blue-500 text-white p-3 hover:bg-blue-600 active:bg-blue-700 transition"
              @click="getContactByNick">Поиск</button>
          </div>
          <div v-for="friend in poiskusers">
            <div v-if="friend.email != user.email" class="rounded-lg p-4 flex items-center border justify-between">
              <div class="gap-3 flex items-center">
                <img v-if="friend.img" :src="friend.img" class="w-24 h-24 object-cover rounded-[50%]" alt="">
                <img v-else
                  src="https://sun9-35.userapi.com/impg/c631928/v631928758/3aa12/0EZXEZFWjdk.jpg?size=2048x1290&quality=96&sign=8792eb719c13ec61472567a369d495e0&c_uniq_tag=USF1lxcERr7UoKbXZUbIGRucbdlF0F4_eYju_-22KH0&type=album"
                  class="w-24 h-24 object-cover rounded-[50%]" alt="">
                <div class="flex flex-col">
                  <div @click="getCurrentUser(friend.email)"
                    class="text-xl cursor-pointer hover:text-blue-600 transition active:text-blue-700">
                    {{ friend.first_name }}
                    {{ friend.last_name }}
                  </div>
                  <p class="opacity-50" v-if="friend.education">{{ friend.education }}</p>
                  <a class="text-blue-500">Написать</a>
                </div>
              </div>
              <button @click="removeFriend(friend.email)" class="p-2 px-3 ml-24 text-white bg-gray-400 rounded-lg"
                v-if="isFriend(friend.email)">В
                контактах</button>
              <button @click="addFriend(friend.email)" class="p-2 ml-24 text-white bg-blue-500 rounded-lg"
                v-else>Добавить в
                контакты</button>
            </div>
          </div>
        </div>
      </div>
      <div class="p-5 border mx-auto w-[750px] rounded-xl" v-if="user.friends.length > 0 && !poiskOpen">
        <div class="flex flex-col">
          <div class="flex items-center">
            <input type="text" class="w-full border p-3 rounded-l-lg focus:outline-none" v-model="poiskusername"
              placeholder="Поиск друзей">
            <button
              class="border-r border-t border-b rounded-r-lg bg-blue-500 text-white p-3 hover:bg-blue-600 active:bg-blue-700 transition"
              @click="getContactByNick">Поиск</button>
          </div>
          <div v-for="friend in allUsers" :key="friend.email">
            <div v-if="friend.email != user.email && isFriend(friend.email)"
              class="rounded-lg p-4 mt-3 flex items-center border justify-between">
              <div class="gap-3 flex items-center">
                <img v-if="friend.img" :src="friend.img" class="w-24 h-24 object-cover rounded-[50%]" alt="">
                <img v-else
                  src="https://sun9-35.userapi.com/impg/c631928/v631928758/3aa12/0EZXEZFWjdk.jpg?size=2048x1290&quality=96&sign=8792eb719c13ec61472567a369d495e0&c_uniq_tag=USF1lxcERr7UoKbXZUbIGRucbdlF0F4_eYju_-22KH0&type=album"
                  class="w-24 h-24 object-cover rounded-[50%]" alt="">
                <div class="flex flex-col">
                  <div @click="getCurrentUser(friend.email)"
                    class="text-xl cursor-pointer hover:text-blue-600 transition active:text-blue-700">
                    {{ friend.first_name }}
                    {{ friend.last_name }}
                  </div>
                  <p class="opacity-50" v-if="friend.education">{{ friend.education }}</p>
                  <a class="text-blue-500">Написать</a>
                </div>
              </div>
              <button @click="removeFriend(friend.email)" class="p-2 px-3 ml-24 text-white bg-gray-400 rounded-lg"
                v-if="isFriend(friend.email)">В
                контактах</button>
              <button @click="addFriend(friend.email)" class="p-2 ml-24 text-white bg-blue-500 rounded-lg"
                v-else>Добавить в
                контакты</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="z-3 w-full h-screen flex gap-36 pt-20" :class="{ profileopen: hidden, profileclose: !hidden }"
      v-if="currentUser.email">
      <div class="flex flex-col w-96 ">
        <img class="h-96  w-[340px] mx-auto object-cover mb-2 border-1 border-blue-700" v-if="!currentUser.img"
          src="https://sun9-35.userapi.com/impg/c631928/v631928758/3aa12/0EZXEZFWjdk.jpg?size=2048x1290&quality=96&sign=8792eb719c13ec61472567a369d495e0&c_uniq_tag=USF1lxcERr7UoKbXZUbIGRucbdlF0F4_eYju_-22KH0&type=album"
          alt="">
        <img class="h-96 shadow w-[340px] mx-auto object-cover mb-2 border-1 border-blue-700" v-if="currentUser.img"
          :src="currentUser.img" alt="">
        <h2 class="text-3xl font-bold border-b-2 py-1 pb-2 border-blue-500 text-center">{{ currentUser.first_name }} {{
          currentUser.last_name }}</h2>
        <div class="flex flex-wrap flex-col items-left mt-3 break-all  w-96 ">
          <h3 class="font-medium mb-3 text-xl text-overflow: ellipsis;">Статус: <span v-if="user.status"
              class="font-normal">{{
                currentUser.status }}</span>
            <span v-if="!currentUser.education" class="font-normal">Неизвестно</span>
          </h3>
          <h3 class="mb-3 font-medium text-xl">Возраст: <span v-if="user.age" class="font-normal">{{ currentUser.age
              }}</span>
            <span v-if="!currentUser.education" class="font-normal">Неизвестно</span>
          </h3>
          <h3 class="mb-3 font-medium text-xl">Хобби: <span v-if="currentUser.hobbi" class="font-normal">{{
            currentUser.hobbi
              }}</span>
            <span v-if="!currentUser.education" class="font-normal">Неизвестно</span>
          </h3>
          <h3 class="font-medium text-xl ">Где учился: <span v-if="currentUser.education" class="font-normal">{{
            currentUser.education }}</span>
            <span v-if="!currentUser.education" class="font-normal">Неизвестно</span>
          </h3>
        </div>
      </div>
      <div class="flex flex-col gap-5" v-if="currentUserPosts.length > 0">
        <div class="mx-auto w-[650px] flex-col-reverse flex">
          <div class="text-left w-full border mb-4 rounded-xl p-4 shadow-md"
            v-for="currentUserPost in currentUserPosts">
            <div class="flex items-center gap-3 my-3 ml-3 justify-between">
              <div class="flex items-center gap-3">
                <img class="w-10 h-10 object-cover rounded-3xl" :src="currentUserPost.avatar" alt="">
                <h2 class="text-xl">{{ currentUserPost.first_name }} {{ currentUserPost.last_name }}</h2>
              </div>
              <p>{{ currentUserPost.createdAt }}</p>
            </div>
            <p class="my-4 ml-3">{{ currentUserPost.text }}</p>
            <img v-if="currentUserPost.img" class="w-full border rounded bg-gray-100 max-h-[600px] object-contain"
              :src="currentUserPost.img" alt="">
          </div>
        </div>
      </div>
      <div class="flex flex-col" v-if="currentUserPosts.length == 0">
        <div class="mx-auto w-[670px]">
          <div class="text-left w-full border mb-4 rounded-xl py-4 shadow-md gap-4 flex flex-col">
            <h2 class="text-center text-2xl p-3">К сожалению у <span class="font-bold">{{ currentUser.first_name }}(а)
                {{ currentUser.last_name }}(а)</span> пока нет постов!</h2>
            <hr>
            <img class="mx-44 my-4 object-cover" src="../public/kit-social-media-post.png" alt="">
          </div>
        </div>
      </div>
    </div>
    <div class="z-3 w-full h-screen flex flex-col gap-5 items-center" v-if="messenger">
      <div class="flex flex-col items-center my-auto" v-if="user.friends.length == 0">
        <img class="object-fit w-44" src="../public/image.png" alt="">
        <h2 class="text-3xl text-center font-semibold text-gray-600">К сожалению, у вас пока нет друзей.</h2>
        <button @click="messenger = false, friendstoggle = true"
          class="bg-blue-500 p-3 text-white rounded-lg shadow-sm mt-4 flex gap-2 items-center hover:bg-blue-600 active:bg-blue-700 transition">
          <img class="rotate-180" src="../public/arrow-next.svg" alt=""> Найти друзей</button>
      </div>
      <div class="my-16 border shadow-sm flex flex-col justify-between w-[650px] h-full rounded-2xl"
        v-if="recipient.length !== 0">
        <div class="px-7 border-b py-3 bg-slate-100 rounded-t-2xl">
          <div class="flex items-center">
            <button class="text-xl text-gray-500 hover:text-gray-700 transition"
              @click="clearRecipient(), getAllContacts()">Назад</button>
            <div class="flex-1"></div>
            <h2 class="text-2xl">{{ recipient.full_name }}</h2>
            <div class="flex-1"></div>
            <img v-if="!recipient.img" class="h-10 w-10 w-max-10 rounded-3xl object-cover"
              src="https://sun9-35.userapi.com/impg/c631928/v631928758/3aa12/0EZXEZFWjdk.jpg?size=2048x1290&quality=96&sign=8792eb719c13ec61472567a369d495e0&c_uniq_tag=USF1lxcERr7UoKbXZUbIGRucbdlF0F4_eYju_-22KH0&type=album"
              alt="">
            <img v-else class="h-10 rounded-3xl min-w-10 max-w-10 object-cover" :src="recipient.img" alt="">
          </div>
        </div>
        <div ref="chatContainer" class="h-[71.1vh] max-h-[71.1vh] overflow-y-auto">
          <div v-if="messages.length !== 0" class="flex flex-col gap-3  p-8">
            <div v-for="message in messages" :class="{ 'right': recipient.email === message.to }" class="max-w-[420px]">
              <p :class="{ 'bg-sky-200': recipient.email === message.to, 'bg-sky-50': recipient.email !== message.to }"
                class="border w-fit p-2 rounded-lg text-lg break-all">{{ message.text }}</p>
            </div>
          </div>
          <div class="bg-sky-100 border-1 border-red-500" v-else>
            <p class="text-red-500 px-6 py-3 text-lg">Ваше сообщение придет {{ recipient.full_name }}, толькое если вы
              есть у него в контактах!</p>
          </div>
        </div>
        <div class="bg-slate-100 border-t rounded-b-2xl">
          <div class="flex px-4 py-3  ">
            <input @keyup.enter="sendMessage(recipient.email), MessageText = ''" type="text" v-model="MessageText"
              class="border focus:outline-none p-2 mt-auto rounded-l-lg w-full" placeholder="Сообщение">
            <button @click="sendMessage(recipient.email), MessageText = ''"
              class="border-r border-t border-b bg-blue-500 text-white p-2 px-3 rounded-r-lg hover:bg-blue-600 active:bg-blue-700 transition">Отправить</button>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-3 mt-14 border py-4 px-8 rounded-xl"
        v-if="allContacts.length > 0 && recipient.length === 0">
        <h2 class="text-3xl font-semibold ml-4"> Все контакты: </h2>
        <div @click="joinChat(contact.email)" class="border p-3 rounded-xl gap-3 bg-white flex items-center w-[632px]"
          v-for="contact in allContacts">
          <img v-if="!contact.img" class="h-10 w-10 w-max-10 rounded-3xl object-cover"
            src="https://sun9-35.userapi.com/impg/c631928/v631928758/3aa12/0EZXEZFWjdk.jpg?size=2048x1290&quality=96&sign=8792eb719c13ec61472567a369d495e0&c_uniq_tag=USF1lxcERr7UoKbXZUbIGRucbdlF0F4_eYju_-22KH0&type=album"
            alt="">
          <img v-else class="h-10 rounded-3xl min-w-10 max-w-10 object-cover" :src="contact.img" alt="">
          <div class="">
            <h2 class="text-xl">{{ contact.full_name }}</h2>
            <p class="text-gray-400  text-ellipsis overflow-hidden w-72 whitespace-nowrap"
              v-if="contact.lastMessage.text != null">{{ contact.lastMessage.text }}</p>
            <p class="text-gray-400" v-else>У вас нет сообщений с(о) {{ contact.full_name }}</p>
          </div>
          <p class="ml-auto mr-3" v-if="contact.lastMessage.text != null">{{
            formattedDate(contact.lastMessage.createdAt) }}</p>
        </div>
      </div>
    </div>
    <div v-if="adminPanel" class="z-3 w-full h-screen pt-10 flex flex-col gap-4 items-center">
      <div v-for="advertisement in advertisements" class="w-[700px] border rounded-lg p-4">
        <div class="flex gap-3 items-center">
          <a :href="advertisement.link" target="_blanck"
            class="text-2xl hover:text-blue-600 transition font-semibold border-b-2 pb-1 border-blue-500 max-w-[400px] overflow-x-auto whitespace-nowrap">
            {{ advertisement.title }}</a>
          <div class="ml-auto flex items-center gap-3">
            <a v-if="advertisement.img" :href="advertisement.img" target="_blank"
              class="border bg-blue-500 text-white p-2 rounded-lg shadow-sm">Посмотреть фото</a>
            <button class="w-10 "><img src="https://img.icons8.com/?size=100&id=W6yf4QF1Lv1e&format=png&color=000000"
                alt=""></button>
          </div>
        </div>
        <p class="mt-3 break-all text-[18px] max-h-32 pr-3 overflow-y-auto "><span class="font-semibold">Текст
            рекламы:</span> {{ advertisement.text }}</p>
      </div>
      <div @click="openPostAdvertisement = true"
        class="w-[700px] hover:bg-zinc-200 bg-zinc-100  active:bg-zinc-300 transition border rounded-lg p-4 flex items-center justify-center">
        <span class=""><img class="w-10" src="https://img.icons8.com/?size=100&id=3220&format=png&color=000000"
            alt=""></span>
      </div>
      <div class="w-full h-full bg-[#00000099] flex justify-center items-center fixed top-0"
        v-if="openPostAdvertisement">
        <div class="text-white z-10 flex flex-col opacity-100 px-4 gap-3 w-96 h-96 relative bg-white rounded-lg"
          v-if="openPostAdvertisement">
          <BUTton class="p-2 border text-black mt-[18px] rounded bg-gray-100 hover:bg-gray-200 transition"
            @click="openPostAdvertisement = false">Закрыть окно</BUTton>
          <input v-model="linkAdvertisement" type="text" class="border rounded p-2 text-black"
            placeholder="Ссылка на продукт">
          <input v-model="titleAdvertisement" type="text" class="border rounded p-2 text-black" placeholder="Заголовок">
          <input v-model="textAdvertisement" type="text" class="border rounded p-2 text-black"
            placeholder="Текст рекламы">
          <input @change="onAdvertisementChange" class="hidden cursor-pointer" id="loadpostphoto" type="file">
          <div class="flex items-center gap-3">
            <label for="loadpostphoto" class="text-gray-400 w-full flex gap-2 border p-2 rounded cursor-pointer">
              Нажмите для загрузки банера
            </label>
            <div class="flex items-center gap-3" v-if="loading">
              <div class="spinner-border text-primary" role="status" />
            </div>
          </div>
          <button class="bg-blue-500 p-3 rounded-lg shadow-sm hover:bg-blue-600 active:bg-blue-700"
            @click="postAdvertisement">Сохранить рекламу</button>
        </div>
      </div>
    </div>
  </div>

</template>
<style>
/* Переходы */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.slide-fade-leave-to

/* .slide-fade-leave-active в <2.1.8 */
  {
  transform: translateX(100%);
  opacity: 0;
  background-color: #00000099
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-enter-to

/* .slide-fade-enter-active в <2.1.8 */
,
.slide-fade-leave {
  transform: translateX(0);
  opacity: 1;
}

.right {
  margin-left: auto;
}

.activedashboard {
  opacity: 100%;
}

.darkmode {
  background-color: #111827;
}

.burger-menu {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  cursor: pointer;
}

.burger-menu div {
  width: 100%;
  height: 4px;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.burger-menu.open .line1 {
  transform: rotate(45deg) translate(4px, 5px);
}

.burger-menu.open .line2 {
  opacity: 0;
}

.burger-menu.open .line3 {
  transform: rotate(-45deg) translate(6px, -8px);
}

.hide {
  width: 96px;
  transition: all 0.7s;
  min-width: 96px;
}

.show {
  width: 354px;
  min-width: 354px;
  transition: all 0.7s;
}

.profileopen {
  margin-left: 27.5%;
  transition: all 0.7s;
}

.profileclose {
  margin-left: 20%;
  transition: all 0.7s;
}

.CheckEmail {
  .input-container {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }

  .input-box {
    width: 80px;
    height: 80px;
    text-align: center;
    font-size: 2.5rem;
    border: 2px solid #ccc;
    border-radius: 4px;
    outline: none;
  }

  .input-box:focus {
    border-color: #007bff;
  }

  button {
    padding: 10px 20px;
    font-size: 1rem;
    color: white;
    background-color: #007bff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
}
</style>
