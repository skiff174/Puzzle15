var cellArray = []; // массив для хранения клеток
var canvasHeight = 0; // высота рабочей области canvas
var prevCell = -1; // предыдущий номер выбранной клетки на игровом поле
var currCell = -1;  // текущий номер выбранной клетки на игровом поле
var countReplace = 0; // счетчик количества перемещений клеток на игровом поле
var endGame = false; // признак окончания игры
var rowNumbers = 4; // размер игрового поля
var requestID;

var createCell = function(x, y, height, number, position) {
  // объект для клетки
  this.x0 = x; //координата х0 клетки
  this.y0 = y; //координата у0 клетки
  this.x1 = x + height - 1; //координата х1 клетки
  this.y1 = y + height - 1; //координата у1 клетки
  this.height = height; // высота клетки
  this.number = number; // число в клетке
  this.checked = false;// признак того, что клетка выделена
  this.position = position; // позиция клетки в массиве чисел
};

function makeSquareBoard() {
  //функция задает квадратное игровое поле, выравнивает его по вертикали, задает шрифты

  var boardHeight; // высота игрового поля
  var boardWidth; // ширина игрового поля
  var contentHeight; // высота блока с id=content

  boardHeight = $('#board').css('height'); // определяем высоту игрового поля
  boardWidth = $('#board').css('width'); // определяем ширину игрового поля

  boardHeight = boardHeight.substring(0, boardHeight.indexOf('px')); // отделяем числовую часть
  boardWidth = boardWidth.substring(0, boardWidth.indexOf('px'));

  boardHeight = Math.round( boardHeight / 100 ) * 100; // округляем высоту до целых сотен
  boardWidth = Math.round( boardWidth / 100 ) * 100; // округляем ширину до целых сотен

  if (boardHeight > boardWidth) boardHeight = boardWidth; // вычисляем минимальную сторону полученного прямоугольника
  else boardWidth = boardHeight;

  $('#board').css('height', boardHeight + 'px'); // задаем полученные значения игровому полю
  $('#board').css('width', boardWidth + 'px'); // задаем полученные значения игровому полю

  canvasHeight = boardHeight; // сохраняем высоту игрового поля в глобальную переменную

  contentHeight = $('#content').css('height'); // определим высоту контейнера
  contentHeight = contentHeight.substring(0, contentHeight.indexOf('px')); // отделим числовую часть
  $('#board').css('margin', Math.round((contentHeight-boardHeight) / 2)-2 + 'px auto'); // зададим отступ по вертикали для игорового поля

  $('#counter').css('font-size', Math.round(canvasHeight/20)+'px'); // задаем размер шрифта для счетчика
  $('#dbcontainer').css('font-size', Math.round(canvasHeight/30)+'px'); // задаем размер шрифта для поля вывода данных БД
  $('#load-form').css('font-size', Math.round(canvasHeight/30)+'px'); // задаем размер шрифта для поля ввода данных для сохранения в БД
  $('button').css('font-size', Math.round(canvasHeight/30)+'px');// задаем размер шрифта для кнопки "Новая игра"
};

function createBoard(height, num) {
  // функция заполняет клетки случайными числами и присваивает им координаты
  cellArray = [];
  var cellHeight = height/num;
  var numArray = []; // массив для хранения уже присвоенных чисел
  var position = 0;
  for (var i = 0; i < height; i += cellHeight) {
    for (var j = 0; j < height; j += cellHeight) {
      do {
        var newNum = Math.round(Math.random() * (Math.pow(num, 2) - 1)); // генерируем число из заданного диапазона
      } while (numArray.indexOf(newNum) != -1) // если этого числа нет в массиве присвоенных чисел, то можно его присвоить клетке
      var newCell = new createCell(j, i, cellHeight, newNum, position);
      position++;
      cellArray.push(newCell);
      numArray.push(newNum);
    };
  };
};

function checkSolution(){
// функция проверяет существование решения расклада пятнашек методом Ноя Чепмена
  var sum = 0;
  var e = 0;

  for (var i = 0; i < cellArray.length; i++){

    if (cellArray[i].number == 0) e = Math.floor(i / rowNumbers) + 1; // вычисляет какому ряду принадлежит пустая клетка

    for (var j = i; j < cellArray.length; j++){
      if ( (cellArray[i].number > cellArray[j].number) &&
            (cellArray[i].number != 0) &&
            (cellArray[j].number != 0) ) sum ++;
    };
  };

  sum += e;
  if (sum % 2 == 0) return true // если решение четное вернуть true
  else return false; // иначе false
};

function checkCreatedBoard(){
// функция генерит рабочее поле до тех пор, пока не будет создана решаемая комбинация
  var end = false;
  do {
    createBoard(canvasHeight, rowNumbers);
    end = checkSolution();
  } while (!end);
};

function drawBoard(){
  // функция отрисовывает клетки и цифры на игровом поле
    var cellImage = new Image();
    cellImage.src = 'images/cell.png';

    var cellCheckedImage = new Image();
    cellCheckedImage.src = 'images/cell2.png';

    var myCanvas = document.getElementById('board');

    myCanvas.width = canvasHeight; //задаем ширину игрового поля
    myCanvas.height = canvasHeight; //задаем высоту игрового поля

    if (myCanvas) {
      var context = myCanvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, myCanvas.width, myCanvas.height); // очищаем рабочую область "canvas"
        context.textAlign = 'center'; //выравниваем текст по горизонтали
        context.textBaseline = 'middle'; // выравниваем текст по вертикали

        cellImage.onload = function() {return true};
        cellCheckedImage.onload = function() {return true};

        if ( cellImage.onload() && cellCheckedImage.onload() ) {
          for (var i = 0; i < cellArray.length; i++) {
            if (cellArray[i].number != 0) {

              context.font = Math.round(cellArray[i].height/2) + 'px Arial'; //задаем размер и стиль шрифта
              if (!cellArray[i].checked) context.drawImage(cellImage,
                                                            cellArray[i].x0,
                                                            cellArray[i].y0,
                                                            cellArray[i].height,
                                                            cellArray[i].height) //рисуем изображение
              else context.drawImage(cellCheckedImage,
                                      cellArray[i].x0,
                                      cellArray[i].y0,
                                      cellArray[i].height,
                                      cellArray[i].height);

              context.fillText(cellArray[i].number,
                               cellArray[i].x0 + Math.round(cellArray[i].height/2),
                               cellArray[i].y0 + Math.round(cellArray[i].height/2)); // вводим текст
            };
          };
        };
      } else alert('Ошибка при работе с canvas.getContext()');
    }  else alert('Ошибка при работе с canvas.getElementById()');

    requestID = requestAnimationFrame(drawBoard);
  };

function findMousePosition() {
  // при нажатии лкм функция вычисляет и возвращает текущее положение мыши на игровом поле
  //var boardPos = document.getElementById('board').getBoundingClientRect();
  var boardPos = $('#board').offset(); // определяем параметры игрового поля (top, right, bottom, left) относительно основного окна
  var myCanvas = document.getElementById('board');

  if (myCanvas) {
    var context = myCanvas.getContext('2d');

    if (context) {
      myCanvas.onclick = function(e) {
        var x = e.pageX - boardPos.left; // определили координату х в игровом поле
        var y = e.pageY - boardPos.top; // определили координату у в игровом поле
        if (endGame == false) checkMousePosition(x,y);
      };

    } else alert('Ошибка при работе с canvas.getContext()');
  }  else alert('Ошибка при работе с canvas.getElementById()');
};

function checkMousePosition(x, y){
    //функция вычисляет какой клетке принадлежит выделенная область и меняет клетки местами при возможности
    var emptyCellChecked = false;
    for (var i = 0; i < cellArray.length; i++) {
      if ((x >= cellArray[i].x0) && (x <= cellArray[i].x1) && (y >= cellArray[i].y0) && (y <= cellArray[i].y1)) {
        // определили что координаты мыши принадлежат конкретной клетке
        if (cellArray[i].number != 0) cellArray[i].checked = true
        else emptyCellChecked = true; // определили что выбрана пустая клетка
        currCell = i;
      } else cellArray[i].checked = false;
    };

    if (emptyCellChecked && (prevCell != -1)) {
      if (checkReplace(prevCell, currCell)) { // если клетки можно поменять местами, то меняем их
        changeCell(prevCell, currCell);
      };
    };
    prevCell = currCell

    checkEndGame(); // проверяем игру на завершенность
  };

function changeCell(prevCell, currCell){
// функция меняет клетки местами
  var newPrevCell = {}; // новый пустой объект

  // скопируем в него все свойства user
  for (var key in cellArray[prevCell]) {
    newPrevCell[key] = cellArray[prevCell][key];
  };

  var newCurrCell = {}; // новый пустой объект

  // скопируем в него все свойства user
  for (var key in cellArray[currCell]) {
    newCurrCell[key] = cellArray[currCell][key];
  };

  cellArray[currCell].x0 = newPrevCell.x0;
  cellArray[currCell].y0 = newPrevCell.y0;
  cellArray[currCell].x1 = newPrevCell.x1;
  cellArray[currCell].y1 = newPrevCell.y1;
  cellArray[currCell].position = newPrevCell.position;
  cellArray[currCell].checked = false;

  var animateSteps = 0;
  var steps = 10;
  var intervalID = setInterval(function(){
    // анимируем перемещение клетки в пустое место
      animateSteps++;
      cellArray[prevCell].x0 = newCurrCell.x0 - ( ((newCurrCell.x0 - newPrevCell.x0) / steps) *(steps - animateSteps) );
      cellArray[prevCell].y0 = newCurrCell.y0 - ( ((newCurrCell.y0 - newPrevCell.y0) / steps) *(steps - animateSteps) );
      cellArray[prevCell].x1 = newCurrCell.x1;
      cellArray[prevCell].y1 = newCurrCell.y1;

      if (animateSteps == steps) clearInterval(intervalID);

    }, 1000/60);

  cellArray[prevCell].position = newCurrCell.position;
  cellArray[prevCell].checked = true;

};

function checkReplace(prev, curr) {
  // функция вычисляет расстояние между выбранными клетками
  // если расстояние равно высоте клетки, то выбраны соседние клетки.
  var dist = Math.sqrt(Math.pow(cellArray[prev].x0 - cellArray[curr].x0,2) +
                        Math.pow(cellArray[prev].y0 - cellArray[curr].y0,2));
  if (dist == cellArray[prev].height) {
    countReplace += 1;
    $('#counter').text("Счетчик: " + countReplace);
    return true;
  } else return false;
};

function checkDateTimeParam(param){
  // добавялем 0 к строке с числом < 10 для улучшения читаемости
  var newParam = '';
  if (param < 10) newParam = '0' + param
  else newParam = param;
  return newParam;
};

function makeDate(date){
  // функция возвращает отформатированную дату
  var newDate = '';
  var year = date.getFullYear(); // получаем текущий год

  var month = date.getMonth() + 1; // получаем месяц
  var day = date.getDate(); // получаем текущий день месяца
  var hours = date.getHours(); // получаем текущий час
  var minutes = date.getMinutes(); // получаем текущую минуту часа
  var seconds = date.getSeconds(); // получаем текущую секунду

  month = checkDateTimeParam(month);
  day = checkDateTimeParam(day);
  hours = checkDateTimeParam(hours);
  minutes = checkDateTimeParam(minutes);
  seconds = checkDateTimeParam(seconds);

  newDate = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
  // формируем  строку с датой и временем для вывода на форму
  return newDate;
};

function checkEndGame(){
// функция проверяет расположение клеток на игровом поле
// если клетки упорядочены то выводит событие.
  var count = 0;
  for (var i = 0; i < cellArray.length; i++){
      if ( (cellArray[i].position == ( cellArray[i].number - 1)) && (cellArray[i].number != 0)) count += 1;
  };

  if (count == (Math.pow(rowNumbers, 2) - 1)) {
    $("#board").css('background','url(images/gift.png) no-repeat'); // меняем фон игрового поля
    $("#board").css('background-size','100% 100%');
    endGame = true;
    if (confirm("Желаете записать результат в БД?")) {
          var date = new Date();
          date = makeDate(date);
          $('#result-field').val(countReplace);
          $('#date-field').val(date);
          $('#popup').css('display','flex'); // отображаеи в главном окне форму
          $('#load-form').css('display','block'); // для ввода данных пользователя
    };
  };
};

function AjaxFormRequest(result_id, form_id, url) {
  // функция осуществляет запрос к серверу без перезагрузки страницы
  $.ajax({
    url:     url, //Адрес подгружаемой страницы
    type:     "POST", //Тип запроса
    dataType: "html", //Тип данных
    data: $("#"+form_id).serialize(), // приводим передаваемые данные к сериализованному виду
    success: function(res) { //Если все нормально
      //document.getElementById(result_id).innerHTML = res;
      $('#'+result_id).html(res); // тоже самое на jquery
    },
    error: function() { //Если ошибка
      //document.getElementById(result_id).innerHTML = "Ошибка при отправке формы";
      $('#'+result_id).html('<h1> Ошибка при отправке формы </h1>'); // тоже самое на jquery
    }
  });
};

function clickSaveButton(){
// функция обрабатывает нажатие на кнопку "Сохранить" на форме
  AjaxFormRequest('dbcontainer', 'form_id', 'php/handler.php');
  $('#popup').css('display','none'); // прячем форму ввода данных пользователя
  $('#load-form').css('display','none');
};

function checkNameField(){
// функция активирует кнопку "Сохранить" если поле ввода не пустое
  var userName = $("[name = username]").val(); // сохраняем значение поля в переменную

  while (userName.indexOf(' ') != -1){
    userName = userName.replace(' ', ''); // убираем ВСЕ символы " "
  };

  if (userName != '')  { // если поле не пустое активируем кнопку
    $("[name = username]").val(userName);
    $('#saveBtn').prop('disabled', false);
  } else $('#saveBtn').prop('disabled', true);
};

function startGame(){
// основная функция, которая инициализирует игру
  prevCell = -1; // предыдущий номер выбранной клетки на игровом поле
  currCell = -1;  // текущий номер выбранной клетки на игровом поле
  countReplace = 0; // счетчик количества перемещений клеток на игровом поле
  endGame = false; // признак окончания игры
  $('#counter').text("Счетчик: " + countReplace);// обнуляем счетчик
  $("#board").css('background','url(images/board.png) no-repeat'); // меняем фон игрового поля
  $("#board").css('background-size','100% 100%');
  makeSquareBoard();
  checkCreatedBoard();
  cancelAnimationFrame(requestID);
  drawBoard();
  findMousePosition();

  $("[name = username]").keyup(function(){
    checkNameField();
  });

  $('#saveBtn').click(function(){
    clickSaveButton();
  });
};

$(document).ready(function() {
  startGame();

  $('#newGameBtn').click(function(){
    // событие на нажатие кнопки "Новая игра"
    startGame();
  });
});
