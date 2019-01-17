const { json } = require('micro');
const fs = require('fs');

function countryFind (countries = [], country = '') {
  return countries.find(el => {
    if (el.name.slice(-2) === 'ия') {
      el.name_dp = el.name.slice(0, -2) + 'ию';
      if (el.name_dp.toString().toLowerCase() === country.toString().toLowerCase()) return true;
    }
    return el.id.toString() === country.toString() || el.name.toString().toLowerCase() === country.toString().toLowerCase() || el.name_rp.toString().toLowerCase() === country.toString().toLowerCase() || el.alias.toString().toLowerCase() === country.toString().toLowerCase();
  });
}

function getRandomInt(min = 0, max = 0) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomPost (posts) {
  let i = 0;
  let id = null;

  if (posts.length <= 2) return posts[0];

  while ( i < 1000 && !posts[id] ) {
    id = getRandomInt(0, posts.length - 1);
    i++;
  }
  return posts[id] || false;
}

function sayOk () {
  const oks = ['Окей', 'Хорошо', 'Ладно'];
  const i = getRandomInt(0, oks.length - 1);
  return oks[i];
}

module.exports = async (req, contentData) => {
  const { request, session, version } = await json(req);
  let temp; // это кароч временный файл с постами, которые уже послушали
  try { temp = fs.readFileSync('temp.json', 'utf-8'); } catch(e){}

  function sayError () {
    return {
      version,
      session,
      response: {
        text: 'Упс. Произошла какая-то ошибка. \nНавык будет остановлен. \nПопробуйте запустить навык снова.',
        tts: 'кажется произошла какая-то ошибка. навык будет остановлен. попробуйте запустить навык снова',
        end_session: true,
      },
    }
  }
  
  function sayDontUnderstand () {
    return {
      version,
      session,
      response: {
        text: 'Не знаю как на это ответить ;) \nДавайте попробуем сначала? Попросите меня рассказать интересный факт или рассказать факт о какой-либо стране.',
        tts: 'не знаю как на это ответить. дав+айте попробуем сначала. попросите меня рассказать интересный факт - или рассказать факт о какой-либо стране.',
        end_session: false,
        temp
      },
    }
  }
  
  function sayNoPostsInCountry (s = 'пока') {
    return {
      version,
      session,
      response: {
        text: 'Об этой стране '+ s +' ничего нет. \nСпросите о чем-нибудь другом, или спросите: "О каких странах можешь рассказать?".',
        tts: 'об этой стране '+ s +' ничего нет. спросите о чем-нибудь друг+ом - или спросите - о каких странах можешь рассказать',
        end_session: false,
      },
    }
  }
  
  // Условия
  const noPosts = !contentData || !contentData.posts || !contentData.posts.length;
  const start = session.new;
  const randomFact = (/(рас)?скажи( интересн\S{2,3})? факт\S{0,2}|ещ(е|ё)|^да(льше)$/g).test(request.command.toLowerCase());
  const countryFact = (/(рас)?скажи( факт\S{0,2})? (про|о)/g).test(request.command.toLowerCase());
  const end = (/^нет$|заверши(ть)?|закончи(ть)?|останови(сь|ть)?|^конец$|прекрати(ть)?|^стоп(э|е)?$/g).test(request.command.toLowerCase());
  const whatCountries = (/(про|о)?каки(е|х) стран(ы|ах)( еще)? (есть|можешь рассказать)/g).test(request.command.toLowerCase());
  const repeat = (/повтори(ть)?/g).test(request.command.toLowerCase());

  // Поведение по условию
  if (noPosts) {
    // Если не удалось загрузить посты
    try { fs.writeFileSync('temp.json', '[]'); } catch(e){}; // обнуляем временный файл
    return sayError();

  } else if (end) {
    // Если попросили завершить
    try { fs.writeFileSync('temp.json', '[]'); } catch(e){}; // обнуляем временный файл
    try { temp = readFileSync('temp.json', 'utf-8'); } catch(e){};

    return {
      version,
      session,
      response: {
        text: sayOk() + '! Надеюсь вам понравилось. Приходите еще! \nИ не забывайте подписываться на No___boundary в Instagram, мне будет приятно!',
        tts: sayOk() + '! надеюсь вам понравилось. приходите ещ+ё! - и не забывайте подписываться на страницу no boundary в инстагр+ам, - мне будет приятно!',
        card: {
          type: "BigImage",
          image_id: "1540737/98202a993bbe7ac77a54",
          title: "No___boundary в Instagram",
          description: sayOk() + '! Надеюсь вам понравилось. Приходите еще! \nИ не забывайте подписываться на No___boundary в Instagram, мне будет приятно!',
          button: {
            text: "ImageLink",
            url: "https://www.instagram.com/no___boundary/",
          },
        },
        end_session: true,
      },
    }
  } else if (start) {
    // Начало навыка
    try { fs.writeFileSync('temp.json', '[]'); } catch(e){}; // обнуляем временный файл
    try { temp = readFileSync('temp.json', 'utf-8'); } catch(e){};

    return {
      version,
      session,
      response: {
        text: 'Безграничный мир активирован! \nЯ могу рассказать интересные факты о разных странах, для этого скажите: "Расскажи интересный факт". \nЕсли вы хотите узнать что-нибудь о конкретной стране, то произнесите, например: "Расскажи факт о России".',
        tts: 'безграничный мир активирован! - я могу рассказать интересные факты о разных странах, для этого скажите: - расскажи интересный факт. - если вы хотите узнать что-нибудь о конкретной стране, то произнесите например: - расскажи факт о россии.',
        end_session: false,
      },
    }
  } else if (whatCountries) {
    let countiesArr = contentData.countries.map(el => el.id.toString() === '0' ? '' : el.name_rp);
    let countriesText = countiesArr.sort((a,b) => Math.random() - 0.5).join(', ');
    if (countriesText.length > 950) {
      countriesText = countriesText.slice(0, 950);
      let lastComma = countriesText.lastIndexOf(',');
      countriesText = countriesText.slice(0, lastComma);
    }

    return {
      version,
      session,
      response: {
        text: 'Я могу рассказать о: ' + countriesText,
        tts: 'Я могу рассказать о - ' + countriesText,
        end_session: false,
      }
    }
  } else if (repeat) {
    // Если попросили повторить
    let post;
    temp = JSON.parse(temp);
    if (temp.length) {
      let id = temp[temp.length - 1];
      post = contentData.posts.find(el => el.id.toString() === id.toString());
    }
    if (post) {
      // получилось
      return {
        version,
        session,
        response: {
          text: 'Повторяю: \n\n' + post.text + '\n\nЕще факт?',
          tts: 'Повторяю - .' + post.text + '. - - ещ+е факт?',
          end_session: false,
        }
      }
    } else {
      // не получилось
      return {
        version,
        session,
        response: {
          text: 'А всё... Едем дальше ;)',
          tts: 'аа, вс+ёоо. - - едем дальше',
          end_session: false,
          temp
        }
      }
    }

  } else if (countryFact) {
    // Если попросили про конкретную страну
    
    const requestCountry = request.nlu.tokens.find(c => countryFind(contentData.countries, c));
    let postCountry, posts, post;
    if (requestCountry) {
      postCountry = countryFind(contentData.countries, requestCountry);
      if (postCountry) posts = contentData.posts.filter(el => el.country === postCountry.id);
      // очищаем от постов которые уже были
      temp = JSON.parse(temp);
      if (temp.length) {
        posts = posts.filter(el => !temp.find(num => el.id.toString() === num.toString()));
      }
      post = getRandomPost(posts);
    }

    if (postCountry && posts && posts.length && post) {
      temp.push(post.id.toString());
      try { fs.writeFileSync('temp.json', JSON.stringify(temp)); } catch(e){};

      return {
        version,
        session,
        response: {
          text: (postCountry && postCountry.id !== 0 ? 'Факт о ' + postCountry.name_rp : 'Вот интересный факт') + '. \n\n' + post.text + '\nЕще факт?',
          tts: (postCountry && postCountry.id !== 0 ? 'факт о ' + postCountry.name_rp : 'вот интересный факт')+ '. - ' + (post.tts || post.text) + '. - - ещ+е факт?',
          end_session: false,
        },
      }
    } else {
      return sayNoPostsInCountry(postCountry ? 'больше' : 'пока');
    }

  } else if (randomFact) {
    // Если попросили рандомный факт
    temp = JSON.parse(temp);
    let posts;
    if (temp.length) posts = contentData.posts.filter(el => !temp.find(num => el.id.toString() === num.toString()));
    else posts = contentData.posts;
    const post = getRandomPost(posts);

    if (post) {
      const postCountry = countryFind(contentData.countries, post.country);
      temp.push(post.id.toString());
      try { fs.writeFileSync('temp.json', JSON.stringify(temp)); } catch(e){};

      return {
        version,
        session,
        response: {
          text: 'Вот интересный факт' + (postCountry && postCountry.id !== 0 ? ' о ' + postCountry.name_rp : '') + '. \n' + post.text + '\n\nЕще факт?',
          tts: 'вот интересный факт' + (postCountry && postCountry.id !== 0 ? ' о ' + postCountry.name_rp : '') + '. ' + (post.tts || post.text) + '. - - ещ+е факт?',
          end_session: false,
        },
      }
    } else {
      return sayNoPostsInCountry();
    }
  } else {
    // Если не понятно что
    return sayDontUnderstand();
  }
};