import * as R from "ramda";
import { COLORS, SHAPES } from "../constants";

/**
 * @file Домашка по FP ч. 1
 *
 * Основная задача — написать самому, или найти в FP библиотеках функции anyPass/allPass
 * Эти функции/их аналоги есть и в ramda и в lodash
 *
 * allPass — принимает массив функций-предикатов, и возвращает функцию-предикат, которая
 * вернет true для заданного списка аргументов, если каждый из предоставленных предикатов
 * удовлетворяет этим аргументам (возвращает true)
 *
 * anyPass — то же самое, только удовлетворять значению может единственная функция-предикат из массива.
 *
 * Если какие либо функции написаны руками (без использования библиотек) это не является ошибкой
 */

// 1. Красная звезда, зеленый квадрат, все остальные белые.
export const validateFieldN1 = (figures) => {
  const isTriangleWhite = R.propEq(SHAPES.TRIANGLE, COLORS.WHITE);
  const isCircleWhite = R.propEq(SHAPES.CIRCLE, COLORS.WHITE);
  const isStarRed = R.propEq(SHAPES.STAR, COLORS.RED);
  const isSquareGreen = R.propEq(SHAPES.SQUARE, COLORS.GREEN);

  console.log(figures);
  console.log("Triangle is white:", isTriangleWhite(figures));
  console.log("Circle is white:", isCircleWhite(figures));
  console.log("Star is red:", isStarRed(figures));
  console.log("Square is green:", isSquareGreen(figures));

  return R.allPass([isTriangleWhite, isCircleWhite, isStarRed, isSquareGreen])(
    figures
  );
};

// 2. Как минимум две фигуры зеленые.
export const validateFieldN2 = (figures) => {
  const compare = R.pipe(
    R.values,
    R.filter(R.equals(COLORS.GREEN)),
    R.length,
    R.gte(R.__, 2)
  );
  return compare(figures);
};

// 3. Количество красных фигур равно кол-ву синих.
export const validateFieldN3 = (figures) => {
  // объединяющая функция
  return R.converge(R.equals, [
    R.pipe(R.values, R.filter(R.equals(COLORS.RED)), R.length),
    R.pipe(R.values, R.filter(R.equals(COLORS.BLUE)), R.length),
  ])(figures);
};

// 4. Синий круг, красная звезда, оранжевый квадрат треугольник любого цвета

export const validateFieldN4 = (figures) => {
  return R.allPass([
    R.propEq(SHAPES.CIRCLE, COLORS.BLUE),
    R.propEq(SHAPES.STAR, COLORS.RED),
    R.propEq(SHAPES.SQUARE, COLORS.ORANGE),
  ])(figures);
};

// 5. Три фигуры одного любого цвета кроме белого (четыре фигуры одного цвета – это тоже true).
export const validateFieldN5 = (figures) => {
  return R.pipe(
    R.values,
    R.filter(R.complement(R.equals(COLORS.WHITE))),
    R.countBy(R.identity),
    R.values,
    R.any(R.gte(R.__, 3))
  )(figures);
};

// 6. Ровно две зеленые фигуры (одна из зелёных – это треугольник), плюс одна красная. Четвёртая оставшаяся любого доступного цвета, но не нарушающая первые два условия
export const validateFieldN6 = (figures) => {
  return R.allPass([
    // Ровно 2 зелёные фигуры
    R.pipe(R.values, R.filter(R.equals(COLORS.GREEN)), R.length, R.equals(2)),

    // Ровно 1 красная фигура
    R.pipe(R.values, R.filter(R.equals(COLORS.RED)), R.length, R.equals(1)),

    // Треугольник зелёный
    R.propEq(SHAPES.TRIANGLE, COLORS.GREEN),
  ])(figures);
};

// 7. Все фигуры оранжевые.
export const validateFieldN7 = (figures) => {
  return R.pipe(
    R.values,
    R.filter(R.equals(COLORS.ORANGE)),
    R.length,
    R.equals(R.__, 4)
  )(figures);
};

// 8. Не красная и не белая звезда, остальные – любого цвета.
export const validateFieldN8 = (figures) => {
  const starColor = R.prop(SHAPES.STAR, figures);
  return R.allPass([
    R.complement(R.equals(COLORS.WHITE)),
    R.complement(R.equals(COLORS.RED)),
  ])(starColor);
};

// 9. Все фигуры зеленые.
export const validateFieldN9 = (figures) => {
  return R.pipe(
    R.values,
    R.filter(R.equals(COLORS.GREEN)),
    R.length,
    R.equals(R.__, 4)
  )(figures);
};

// 10. Треугольник и квадрат одного цвета (не белого), остальные – любого цвета
export const validateFieldN10 = (figures) => {
  return R.allPass([
    R.converge(R.equals, [R.prop(SHAPES.TRIANGLE), R.prop(SHAPES.SQUARE)]),
    R.complement(R.propEq(SHAPES.TRIANGLE, COLORS.WHITE)),
    R.complement(R.propEq(SHAPES.SQUARE, COLORS.WHITE)),
  ])(figures)
};
