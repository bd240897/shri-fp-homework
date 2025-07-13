import * as R from "ramda";

/**
 * @file Домашка по FP ч. 2
 *
 * Подсказки:
 * Метод get у инстанса Api – каррированый
 * GET / https://animals.tech/{id}
 *
 * GET / https://api.tech/numbers/base
 * params:
 * – number [Int] – число
 * – from [Int] – из какой системы счисления
 * – to [Int] – в какую систему счисления
 *
 * Иногда промисы от API будут приходить в состояние rejected, (прямо как и API в реальной жизни)
 * Ответ будет приходить в поле {result}
 */
import Api from "../tools/api";

const api = new Api();

/**
 * Я – пример, удали меня
 */
const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

const processSequence = async ({
  value,
  writeLog,
  handleSuccess,
  handleError,
}) => {
  const validatedNumber = R.pipe(
    // 1. Берем строку N. Пишем изначальную строку в writeLog
    R.tap(writeLog),
    // 2. Строка валидируется по следующим правилам:
    // кол-во символов в числе должно быть меньше 10.
    // кол-во символов в числе должно быть больше 2.
    // число должно быть положительным
    // символы в строке только [0-9] и точка т.е. число в 10-ной системе счисления (возможно с плавающей запятой)
    // В случае ошибки валидации вызвать handleError с 'ValidationError' строкой в качестве аргумента
    R.tap(
      R.ifElse(
        R.pipe(
          // R.prop(value),
          R.allPass([
            // Длина от 2 до 10 символов
            R.pipe(
              String,
              R.prop("length"),
              R.both(R.gte(R.__, 2), R.lte(R.__, 10))
            ),
            R.pipe(Number, R.gt(R.__, 0)),
            R.test(/^[0-9.]+$/),
          ])
        ),
        // Если валидация успешна
        handleSuccess,

        // Если валидация не прошла
        () => handleError("ValidationError")
      )
    ),
    // 3. Привести строку к числу, округлить к ближайшему целому с точностью до единицы, записать в writeLog.
    R.tap(console.log),
    Number,
    Math.round,
    R.tap(writeLog)
  )(value);

  // 4. C помощью API /numbers/base перевести из 10-й системы счисления в двоичную, результат записать в writeLog
  const { result: binary } = await api.get("https://api.tech/numbers/base", {
    from: 10,
    to: 2,
    number: validatedNumber.toString(),
  });
  writeLog(binary);

  const processBinary = R.pipe(
    R.prop("length"),
    R.tap((len) => {
      // Взять кол-во символов в полученном от API числе записать в writeLog
      writeLog(len); 
      // Возвести в квадрат с помощью Javascript записать в writeLog
      writeLog(len ** 2); 
    }),
    // Взять остаток от деления на 3, записать в writeLog
    (len) => len ** 2 % 3, // Остаток от деления
    R.tap(writeLog)
  )({ length: binary.length });

  // C помощью API /animals.tech/id/name получить случайное животное используя полученный остаток в качестве id
  const { name: animal } = await api.get(`/animals/tech/id/${processBinary}`);
  
  // Завершить цепочку вызовом handleSuccess в который в качестве аргумента положить результат полученный на предыдущем шаге
  handleSuccess(animal);
};

export default processSequence;
