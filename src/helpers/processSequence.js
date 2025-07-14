import * as R from "ramda";
import Api from "../tools/api";

const api = new Api();

// Функция для повторных попыток запросов
const withRetry =
  (fn, retries = 3, delay = 1000) =>
  async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (retries <= 0) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay)(...args);
    }
  };

const processSequence = async ({
  value,
  writeLog,
  handleSuccess,
  handleError,
}) => {
  try {
    // 1. Берем строку N. Пишем изначальную строку в writeLog
    writeLog(value);

    // 2. Строка валидируется по следующим правилам:
    // кол-во символов в числе должно быть меньше 10.
    // кол-во символов в числе должно быть больше 2.
    // число должно быть положительным
    // символы в строке только [0-9] и точка т.е. число в 10-ной системе счисления (возможно с плавающей запятой)
    // В случае ошибки валидации вызвать handleError с 'ValidationError' строкой в качестве аргумента
    const isValid = R.allPass([
      R.pipe(String, R.prop("length"), R.both(R.gt(R.__, 2), R.lt(R.__, 10))),
      R.pipe(Number, R.gt(R.__, 0)),
      R.test(/^[0-9.]+$/),
    ]);

    if (!isValid(value)) {
      handleError("ValidationError");
      return;
    }

    // 3. Привести строку к числу, округлить к ближайшему целому с точностью до единицы, записать в writeLog.
    const number = R.pipe(Number, Math.round)(value);
    writeLog(number);

    // 4. C помощью API /numbers/base перевести из 10-й системы счисления в двоичную, результат записать в writeLog
    const getBinary = () =>
      api.get("https://api.tech/numbers/base")({
        from: 10,
        to: 2,
        number: number.toString(),
      });

    const { result: binary } = await withRetry(getBinary)();
    writeLog(binary);

    // 5-7. Обработка бинарного числа: длина, квадрат, остаток от деления
    const remainder = R.pipe(
      R.prop("length"),
      R.tap(writeLog),
      R.converge(R.multiply, [R.identity, R.identity]),
      R.tap(writeLog),
      R.modulo(R.__, 3),
      R.tap(writeLog)
    )(binary);

    // 8. C помощью API /animals.tech/id/name получить случайное животное используя полученный остаток в качестве id
    const getAnimal = () => api.get(`https://animals.tech/${remainder}`)({});
    const { result: animal } = await withRetry(getAnimal)();

    // 9. Завершить цепочку вызовом handleSuccess в который в качестве аргумента положить результат полученный на предыдущем шаге
    handleSuccess(animal);
  } catch (error) {
    handleError(error.message);
  }
};

export default processSequence;
