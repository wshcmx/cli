# @wshcmx/cli

`wshcmx` - набор CLI-инструментов предназначенный для автоматизации сборки и отслеживания изменений в кодовой базе с последующей транспиляцией в синтаксис WebSoftHCM.
Инструменты полезны для разработчиков, которые работают с WebSoftHCM и хотят упростить процесс разработки, обеспечивая быструю и корректную работу с исходным кодом.

## Основные возможности
- Сборка проекта: Выполняет полную сборку, преобразуя исходный код в совместимый с WebSoftHCM формат.
- Отслеживание изменений: Запускает процесс транспиляции автоматически при изменении исходных файлов, что помогает мгновенно видеть результаты в реальном времени.
- Транспиляция в WebSoftHCM синтаксис: Преобразует современный JavaScript или TypeScript в код, поддерживаемый WebSoftHCM, с учетом всех его особенностей.

## Как использовать
1. Установите CLI-инструмент локально в проект при необходимости:

```bash
# установка локально в проект
npm install wshcmx -D
# или глобально
npm install wshcmx -g
```

2. Запустите сборку:

Выполнение одноразовой сборки проекта

```bash
npx wshcmx build
```

3. Запустите режим отслеживания:

Запускает CLI-инструмент в режиме отслеживания, при котором изменения в исходном коде будут автоматически транспилироваться.

```bash
npx wshcmx watch
```

## Флаги
CLI поддерживает флаги:

| Флаг | Описание |
| - | - |
| **--include-non-ts-files** | Добавляет копирование файлов с любым расширением **не _js_/_ts_**.\ Файлы обрабатываются по логике **include**, **files** и **exclude** в **tsconfig.json** |
| **--retain-non-ascii-characters** | Декодирует не ASCII символы после транспиляции |
| **--retain-imports-as-comments** | Оставляет импорты в комментариях |

## Основные особенности

### Особенности из коробки

TypeScript позволяет из коробки пользоваться некоторыми дополнительными конструкциями:

- Параметры по умолчанию

```ts
function method(argument: string = "default string") {
    // ...
}
```

- Интерполяция шаблонных строк

```ts
var stringState = "interpolated";
alert(`I insisted that substring be ${stringState}`);
```

### Особенности данного CLI

Этот CLI также добавляет некоторые возможности при транспиляции кода:

#### Конвертация enum в объекты

```ts
enum Locales {
    ru = 'ru'
    en = 'en'
}

// -->

var Locales = {
    en: "en",
    ru: "ru"
};
```

#### Удаление import и export конструкций

> [!NOTE] import конструкции заменяются на ;, что позволяет сохранить строковую нумерацию в транспилируемом коде

```ts
import { wshcmx } from "@wshcmx/lib";

export function method() {
    // ...
}

// -->

;

function method() {
  // ...
}
```

#### Транспиляция шаблонных строк после TypeScript 4.4.4

Шаблонные строки после TypeScript 4.4.4 начали собираться с помощью метода `concat`:

```ts
var stringState = "interpolated";
alert(`I insisted that substring be ${stringState}`);

// -->
var stringState = "interpolated";
alert("I insisted that substring be ".concat(stringState));
```

CLI конвертирует это в формат, похожий на TypeScript до 4.4.4.


```ts
var stringState = "interpolated";
alert(`I insisted that substring be ${stringState}`);

// -->
var stringState = "interpolated";
alert("I insisted that substring be " + stringState + "");
```

#### Конвертация namespace

```ts
export namespace Module {
    export const VARIABLE = "VARIABLE_VALUES";
    export function method() {
        // ...
    }
}

// -->

"META:NAMESPACE:Module";
var VARIABLE = "VARIABLE_VALUES";
function method() {
    // ...
}
```

## Контрибуция
Контрибуции приветствуются! Пожалуйста, создайте Pull Request или свяжитесь с нами через Issues, если у вас есть предложения или обнаружены ошибки.

## Лицензия: MIT
