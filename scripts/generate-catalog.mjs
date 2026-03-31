import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const catalogDir = path.join(rootDir, 'catalog');
const catalogPath = path.join(catalogDir, 'vuetify-catalog.json');

const catalog = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://raw.githubusercontent.com/alis-exchange/a2ui-vuetify-renderer/main/catalog/vuetify-catalog.json",
  title: "A2UI Vuetify Catalog",
  description: "Catalog of A2UI components implemented with Vuetify 4 for the Vue renderer.",
  catalogId: "https://raw.githubusercontent.com/alis-exchange/a2ui-vuetify-renderer/main/catalog/vuetify-catalog.json",
  components: {
    Text: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Text" },
            text: { "$ref": "#/$defs/DynamicString" },
            variant: { type: "string", enum: ["h1", "h2", "h3", "h4", "h5", "caption", "body"], default: "body" }
          },
          required: ["component", "text"]
        }
      ]
    },
    Image: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Image" },
            url: { "$ref": "#/$defs/DynamicString" },
            description: { "$ref": "#/$defs/DynamicString" },
            fit: { type: "string", enum: ["contain", "cover", "fill", "none", "scaleDown"], default: "fill" },
            variant: { type: "string", enum: ["icon", "avatar", "smallFeature", "mediumFeature", "largeFeature", "header"], default: "mediumFeature" }
          },
          required: ["component", "url"]
        }
      ]
    },
    Icon: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Icon" },
            name: {
              oneOf: [
                { type: "string" },
                { type: "object", properties: { path: { type: "string" } }, required: ["path"] }
              ]
            }
          },
          required: ["component", "name"]
        }
      ]
    },
    Divider: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Divider" },
            axis: { type: "string", enum: ["horizontal", "vertical"], default: "horizontal" }
          },
          required: ["component"]
        }
      ]
    },
    Row: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Row" },
            children: { "$ref": "#/$defs/ChildList" },
            justify: { type: "string", enum: ["center", "end", "spaceAround", "spaceBetween", "spaceEvenly", "start", "stretch"], default: "start" },
            align: { type: "string", enum: ["start", "center", "end", "stretch"], default: "stretch" }
          },
          required: ["component", "children"]
        }
      ]
    },
    Column: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Column" },
            children: { "$ref": "#/$defs/ChildList" },
            justify: { type: "string", enum: ["start", "center", "end", "spaceBetween", "spaceAround", "spaceEvenly", "stretch"], default: "start" },
            align: { type: "string", enum: ["center", "end", "start", "stretch"], default: "stretch" }
          },
          required: ["component", "children"]
        }
      ]
    },
    Card: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Card" },
            child: { "$ref": "#/$defs/ComponentId" }
          },
          required: ["component", "child"]
        }
      ]
    },
    Button: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        { "$ref": "#/$defs/Checkable" },
        {
          type: "object",
          properties: {
            component: { const: "Button" },
            child: { "$ref": "#/$defs/ComponentId" },
            variant: { type: "string", enum: ["default", "primary", "borderless"], default: "default" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "child", "action"]
        }
      ]
    },
    TextField: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        { "$ref": "#/$defs/Checkable" },
        {
          type: "object",
          properties: {
            component: { const: "TextField" },
            label: { "$ref": "#/$defs/DynamicString" },
            value: { "$ref": "#/$defs/DynamicString" },
            variant: { type: "string", enum: ["filled", "outlined", "underlined"], default: "outlined" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "label"]
        }
      ]
    },
    TextArea: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        { "$ref": "#/$defs/Checkable" },
        {
          type: "object",
          properties: {
            component: { const: "TextArea" },
            label: { "$ref": "#/$defs/DynamicString" },
            value: { "$ref": "#/$defs/DynamicString" },
            variant: { type: "string", enum: ["filled", "outlined", "underlined"], default: "outlined" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "label"]
        }
      ]
    },
    NumberInput: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        { "$ref": "#/$defs/Checkable" },
        {
          type: "object",
          properties: {
            component: { const: "NumberInput" },
            label: { "$ref": "#/$defs/DynamicString" },
            value: { "$ref": "#/$defs/DynamicNumber" },
            variant: { type: "string", enum: ["filled", "outlined", "underlined"], default: "outlined" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "label"]
        }
      ]
    },
    Checkbox: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        { "$ref": "#/$defs/Checkable" },
        {
          type: "object",
          properties: {
            component: { const: "Checkbox" },
            label: { "$ref": "#/$defs/DynamicString" },
            value: { "$ref": "#/$defs/DynamicBoolean" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "label", "value"]
        }
      ]
    },
    RadioButton: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        { "$ref": "#/$defs/Checkable" },
        {
          type: "object",
          properties: {
            component: { const: "RadioButton" },
            label: { "$ref": "#/$defs/DynamicString" },
            options: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { "$ref": "#/$defs/DynamicString" },
                  value: { type: "string" }
                },
                required: ["label", "value"]
              }
            },
            value: { "$ref": "#/$defs/DynamicString" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "options", "value"]
        }
      ]
    },
    Select: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        { "$ref": "#/$defs/Checkable" },
        {
          type: "object",
          properties: {
            component: { const: "Select" },
            label: { "$ref": "#/$defs/DynamicString" },
            options: { type: "array" },
            value: { type: ["string", "array"] },
            variant: { type: "string", enum: ["multipleSelection", "mutuallyExclusive"], default: "mutuallyExclusive" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "options", "value"]
        }
      ]
    },
    Autocomplete: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Autocomplete" },
            label: { "$ref": "#/$defs/DynamicString" },
            options: { type: "array" },
            value: { type: ["string", "array"] },
            variant: { type: "string", enum: ["multipleSelection", "mutuallyExclusive"], default: "mutuallyExclusive" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "options", "value"]
        }
      ]
    },
    Combobox: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Combobox" },
            label: { "$ref": "#/$defs/DynamicString" },
            options: { type: "array" },
            value: { type: ["string", "array"] },
            variant: { type: "string", enum: ["multipleSelection", "mutuallyExclusive"], default: "mutuallyExclusive" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "options", "value"]
        }
      ]
    },
    Slider: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        { "$ref": "#/$defs/Checkable" },
        {
          type: "object",
          properties: {
            component: { const: "Slider" },
            label: { "$ref": "#/$defs/DynamicString" },
            min: { type: "number", default: 0 },
            max: { type: "number" },
            value: { "$ref": "#/$defs/DynamicNumber" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "value", "max"]
        }
      ]
    },
    RangeSlider: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "RangeSlider" },
            label: { "$ref": "#/$defs/DynamicString" },
            min: { type: "number", default: 0 },
            max: { type: "number" },
            value: { 
              oneOf: [
                { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 },
                { type: "object", properties: { path: { type: "string" } }, required: ["path"] }
              ]
            },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "value", "max"]
        }
      ]
    },
    DatePicker: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        { "$ref": "#/$defs/Checkable" },
        {
          type: "object",
          properties: {
            component: { const: "DatePicker" },
            label: { "$ref": "#/$defs/DynamicString" },
            value: { "$ref": "#/$defs/DynamicString" },
            min: { "$ref": "#/$defs/DynamicString" },
            max: { "$ref": "#/$defs/DynamicString" },
            color: { type: "string" },
            multiple: {
              oneOf: [
                { type: "boolean" },
                { type: "string", enum: ["range"] }
              ]
            },
            readonly: { "$ref": "#/$defs/DynamicBoolean" },
            disabled: { "$ref": "#/$defs/DynamicBoolean" },
            landscape: { "$ref": "#/$defs/DynamicBoolean" },
            showAdjacentMonths: { "$ref": "#/$defs/DynamicBoolean" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "value"]
        }
      ]
    },
    TimePicker: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "TimePicker" },
            label: { "$ref": "#/$defs/DynamicString" },
            value: { "$ref": "#/$defs/DynamicString" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "value"]
        }
      ]
    },
    FileInput: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "FileInput" },
            label: { "$ref": "#/$defs/DynamicString" },
            value: { "$ref": "#/$defs/DynamicValue" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "label"]
        }
      ]
    },
    Form: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Form" },
            children: { "$ref": "#/$defs/ChildList" }
          },
          required: ["component", "children"]
        }
      ]
    },
    List: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "List" },
            children: { "$ref": "#/$defs/ChildList" },
            direction: { type: "string", enum: ["vertical", "horizontal"], default: "vertical" },
            align: { type: "string", enum: ["start", "center", "end", "stretch"], default: "stretch" }
          },
          required: ["component", "children"]
        }
      ]
    },
    Table: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Table" },
            items: { type: "array" },
            columns: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  key: { type: "string" }
                }
              }
            }
          },
          required: ["component", "items", "columns"]
        }
      ]
    },
    TreeView: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "TreeView" },
            items: { type: "array" }
          },
          required: ["component", "items"]
        }
      ]
    },
    Calendar: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Calendar" },
            events: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  start: { type: "string", description: "Start date/time in YYYY-MM-DD or YYYY-MM-DD HH:mm format." },
                  end: { type: "string", description: "End date/time in YYYY-MM-DD or YYYY-MM-DD HH:mm format." },
                  color: { type: "string" },
                  timed: { type: "boolean" }
                },
                required: ["name", "start"]
              }
            },
            type: { type: "string", enum: ["month", "week", "day", "4day", "custom-weekly", "custom-daily", "category"], default: "month" },
            value: { "$ref": "#/$defs/DynamicString" },
            weekdays: { type: "array", items: { type: "number" } },
            color: { type: "string" },
            eventColor: { type: "string" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "events"]
        }
      ]
    },
    Alert: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Alert" },
            title: { "$ref": "#/$defs/DynamicString" },
            text: { "$ref": "#/$defs/DynamicString" },
            variant: { type: "string", enum: ["success", "info", "warning", "error"], default: "info" },
            child: { "$ref": "#/$defs/ComponentId" }
          },
          required: ["component"]
        }
      ]
    },
    Badge: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Badge" },
            content: { "$ref": "#/$defs/DynamicString" },
            color: { type: "string" },
            child: { "$ref": "#/$defs/ComponentId" }
          },
          required: ["component", "content", "child"]
        }
      ]
    },
    Banner: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Banner" },
            text: { "$ref": "#/$defs/DynamicString" },
            icon: { "$ref": "#/$defs/DynamicString" },
            child: { "$ref": "#/$defs/ComponentId" }
          },
          required: ["component", "text"]
        }
      ]
    },
    Rating: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Rating" },
            max: { type: "number", default: 5 },
            value: { "$ref": "#/$defs/DynamicNumber" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "value"]
        }
      ]
    },
    EmptyState: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "EmptyState" },
            title: { "$ref": "#/$defs/DynamicString" },
            text: { "$ref": "#/$defs/DynamicString" },
            icon: { "$ref": "#/$defs/DynamicString" },
            child: { "$ref": "#/$defs/ComponentId" }
          },
          required: ["component"]
        }
      ]
    },
    ExpansionPanel: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "ExpansionPanel" },
            title: { "$ref": "#/$defs/DynamicString" },
            child: { "$ref": "#/$defs/ComponentId" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "title", "child"]
        }
      ]
    },
    Chip: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Chip" },
            text: { "$ref": "#/$defs/DynamicString" },
            child: { "$ref": "#/$defs/ComponentId" }
          },
          required: ["component"]
        }
      ]
    },
    Avatar: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Avatar" },
            image: { "$ref": "#/$defs/DynamicString" },
            text: { "$ref": "#/$defs/DynamicString" },
            child: { "$ref": "#/$defs/ComponentId" }
          },
          required: ["component"]
        }
      ]
    },
    Tabs: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Tabs" },
            tabs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { "$ref": "#/$defs/DynamicString" },
                  child: { "$ref": "#/$defs/ComponentId" }
                },
                required: ["title", "child"]
              }
            },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "tabs"]
        }
      ]
    },
    Modal: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Modal" },
            trigger: { "$ref": "#/$defs/ComponentId" },
            content: { "$ref": "#/$defs/ComponentId" },
            open: { "$ref": "#/$defs/DynamicBoolean" },
            action: { "$ref": "#/$defs/Action" }
          },
          required: ["component", "trigger", "content"]
        }
      ]
    },
    Video: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "Video" },
            url: { "$ref": "#/$defs/DynamicString" },
            autoplay: { "$ref": "#/$defs/DynamicBoolean" },
            controls: { "$ref": "#/$defs/DynamicBoolean" },
            loop: { "$ref": "#/$defs/DynamicBoolean" },
            muted: { "$ref": "#/$defs/DynamicBoolean" }
          },
          required: ["component", "url"]
        }
      ]
    },
    AudioPlayer: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        {
          type: "object",
          properties: {
            component: { const: "AudioPlayer" },
            url: { "$ref": "#/$defs/DynamicString" },
            autoplay: { "$ref": "#/$defs/DynamicBoolean" },
            controls: { "$ref": "#/$defs/DynamicBoolean" },
            loop: { "$ref": "#/$defs/DynamicBoolean" },
            muted: { "$ref": "#/$defs/DynamicBoolean" }
          },
          required: ["component", "url"]
        }
      ]
    },
    ChoicePicker: {
      type: "object",
      allOf: [
        { "$ref": "#/$defs/ComponentCommon" },
        { "$ref": "#/$defs/CatalogComponentCommon" },
        { "$ref": "#/$defs/Checkable" },
        {
          type: "object",
          properties: {
            component: { const: "ChoicePicker" },
            label: { "$ref": "#/$defs/DynamicString" },
            options: { type: "array" },
            value: { type: ["string", "array"] },
            variant: { type: "string", enum: ["multipleSelection", "mutuallyExclusive"], default: "mutuallyExclusive" },
            displayStyle: { type: "string", enum: ["list", "dropdown", "segmented"], default: "dropdown" }
          },
          required: ["component", "options", "value"]
        }
      ]
    }
  },
  functions: {
    required: {
      type: "object",
      description: "Checks that the value is not null, undefined, or empty.",
      properties: {
        call: { const: "required" },
        args: {
          type: "object",
          properties: { value: { description: "The value to check." } },
          required: ["value"],
          additionalProperties: false
        },
        returnType: { const: "boolean" }
      },
      required: ["call", "args"],
      unevaluatedProperties: false
    },
    regex: {
      type: "object",
      description: "Checks that the value matches a regular expression string.",
      properties: {
        call: { const: "regex" },
        args: {
          type: "object",
          properties: {
            value: { "$ref": "#/$defs/DynamicString" },
            pattern: { type: "string", description: "The regex pattern to match against." }
          },
          required: ["value", "pattern"],
          unevaluatedProperties: false
        },
        returnType: { const: "boolean" }
      },
      required: ["call", "args"],
      unevaluatedProperties: false
    },
    length: {
      type: "object",
      description: "Checks string length constraints.",
      properties: {
        call: { const: "length" },
        args: {
          type: "object",
          properties: {
            value: { "$ref": "#/$defs/DynamicString" },
            min: { type: "integer", minimum: 0, description: "The minimum allowed length." },
            max: { type: "integer", minimum: 0, description: "The maximum allowed length." }
          },
          required: ["value"],
          anyOf: [{ required: ["min"] }, { required: ["max"] }],
          unevaluatedProperties: false
        },
        returnType: { const: "boolean" }
      },
      required: ["call", "args"],
      unevaluatedProperties: false
    },
    numeric: {
      type: "object",
      description: "Checks numeric range constraints.",
      properties: {
        call: { const: "numeric" },
        args: {
          type: "object",
          properties: {
            value: { "$ref": "#/$defs/DynamicNumber" },
            min: { type: "number", description: "The minimum allowed value." },
            max: { type: "number", description: "The maximum allowed value." }
          },
          required: ["value"],
          anyOf: [{ required: ["min"] }, { required: ["max"] }],
          unevaluatedProperties: false
        },
        returnType: { const: "boolean" }
      },
      required: ["call", "args"],
      unevaluatedProperties: false
    },
    email: {
      type: "object",
      description: "Checks that the value is a valid email address.",
      properties: {
        call: { const: "email" },
        args: {
          type: "object",
          properties: {
            value: { "$ref": "#/$defs/DynamicString" }
          },
          required: ["value"],
          unevaluatedProperties: false
        },
        returnType: { const: "boolean" }
      },
      required: ["call", "args"],
      unevaluatedProperties: false
    },
    formatString: {
      type: "object",
      description: "Performs string interpolation of data model values and other functions in the catalog functions list and returns the resulting string. The value string can contain interpolated expressions in the `${expression}` format.",
      properties: {
        call: { const: "formatString" },
        args: {
          type: "object",
          properties: {
            value: { "$ref": "#/$defs/DynamicString" }
          },
          required: ["value"],
          unevaluatedProperties: false
        },
        returnType: { const: "string" }
      },
      required: ["call", "args"],
      unevaluatedProperties: false
    },
    formatNumber: {
      type: "object",
      description: "Formats a number with the specified grouping and decimal precision.",
      properties: {
        call: { const: "formatNumber" },
        args: {
          type: "object",
          properties: {
            value: { "$ref": "#/$defs/DynamicNumber", description: "The number to format." },
            decimals: { "$ref": "#/$defs/DynamicNumber", description: "Optional. The number of decimal places to show. Defaults to 0 or 2 depending on locale." },
            grouping: { "$ref": "#/$defs/DynamicBoolean", description: "Optional. If true, uses locale-specific grouping separators (e.g. '1,000'). If false, returns raw digits (e.g. '1000'). Defaults to true." }
          },
          required: ["value"],
          unevaluatedProperties: false
        },
        returnType: { const: "string" }
      },
      required: ["call", "args"],
      unevaluatedProperties: false
    },
    formatCurrency: {
      type: "object",
      description: "Formats a number as a currency string.",
      properties: {
        call: { const: "formatCurrency" },
        args: {
          type: "object",
          properties: {
            value: { "$ref": "#/$defs/DynamicNumber", description: "The monetary amount." },
            currency: { "$ref": "#/$defs/DynamicString", description: "The ISO 4217 currency code (e.g., 'USD', 'EUR')." },
            decimals: { "$ref": "#/$defs/DynamicNumber", description: "Optional. The number of decimal places to show. Defaults to 0 or 2 depending on locale." },
            grouping: { "$ref": "#/$defs/DynamicBoolean", description: "Optional. If true, uses locale-specific grouping separators (e.g. '1,000'). If false, returns raw digits (e.g. '1000'). Defaults to true." }
          },
          required: ["currency", "value"],
          unevaluatedProperties: false
        },
        returnType: { const: "string" }
      },
      required: ["call", "args"],
      unevaluatedProperties: false
    },
    formatDate: {
      type: "object",
      description: "Formats a timestamp into a string using a pattern.",
      properties: {
        call: { const: "formatDate" },
        args: {
          type: "object",
          properties: {
            value: { "$ref": "#/$defs/DynamicValue", description: "The date to format." },
            format: { "$ref": "#/$defs/DynamicString", description: "A Unicode TR35 date pattern string." }
          },
          required: ["format", "value"],
          unevaluatedProperties: false
        },
        returnType: { const: "string" }
      },
      required: ["call", "args"],
      unevaluatedProperties: false
    },
    pluralize: {
      type: "object",
      description: "Returns a localized string based on the Common Locale Data Repository (CLDR) plural category of the count (zero, one, two, few, many, other).",
      properties: {
        call: { const: "pluralize" },
        args: {
          type: "object",
          properties: {
            value: { "$ref": "#/$defs/DynamicNumber", description: "The numeric value used to determine the plural category." },
            zero: { "$ref": "#/$defs/DynamicString", description: "String for the 'zero' category (e.g., 0 items)." },
            one: { "$ref": "#/$defs/DynamicString", description: "String for the 'one' category (e.g., 1 item)." },
            two: { "$ref": "#/$defs/DynamicString", description: "String for the 'two' category (used in Arabic, Welsh, etc.)." },
            few: { "$ref": "#/$defs/DynamicString", description: "String for the 'few' category (e.g., small groups in Slavic languages)." },
            many: { "$ref": "#/$defs/DynamicString", description: "String for the 'many' category (e.g., large groups in various languages)." },
            other: { "$ref": "#/$defs/DynamicString", description: "The default/fallback string (used for general plural cases)." }
          },
          required: ["value", "other"],
          unevaluatedProperties: false
        },
        returnType: { const: "string" }
      },
      required: ["call", "args"],
      unevaluatedProperties: false
    },
    openUrl: {
      type: "object",
      description: "Opens the specified URL in a browser or handler. This function has no return value.",
      properties: {
        call: { const: "openUrl" },
        args: {
          type: "object",
          properties: {
            url: { type: "string", format: "uri", description: "The URL to open." }
          },
          required: ["url"],
          additionalProperties: false
        },
        returnType: { const: "void" }
      },
      required: ["call", "args"],
      unevaluatedProperties: false
    },
    and: {
      type: "object",
      description: "Performs a logical AND operation on a list of boolean values.",
      properties: {
        call: { const: "and" },
        args: {
          type: "object",
          properties: {
            values: { type: "array", description: "The list of boolean values to evaluate.", items: { "$ref": "#/$defs/DynamicBoolean" }, minItems: 2 }
          },
          required: ["values"],
          unevaluatedProperties: false
        },
        returnType: { const: "boolean" }
      },
      required: ["call", "args"],
      unevaluatedProperties: false
    },
    or: {
      type: "object",
      description: "Performs a logical OR operation on a list of boolean values.",
      properties: {
        call: { const: "or" },
        args: {
          type: "object",
          properties: {
            values: { type: "array", description: "The list of boolean values to evaluate.", items: { "$ref": "#/$defs/DynamicBoolean" }, minItems: 2 }
          },
          required: ["values"],
          unevaluatedProperties: false
        },
        returnType: { const: "boolean" }
      },
      required: ["call", "args"],
      unevaluatedProperties: false
    },
    not: {
      type: "object",
      description: "Performs a logical NOT operation on a boolean value.",
      properties: {
        call: { const: "not" },
        args: {
          type: "object",
          properties: {
            value: { "$ref": "#/$defs/DynamicBoolean", description: "The boolean value to negate." }
          },
          required: ["value"],
          unevaluatedProperties: false
        },
        returnType: { const: "boolean" }
      },
      required: ["call", "args"],
      unevaluatedProperties: false
    }
  },
  $defs: {
    ComponentCommon: {
      type: "object",
      properties: {
        component: {
          type: "string",
          description: "The name of the component type."
        },
        id: {
          type: "string",
          description: "An optional unique identifier for the component. If not provided, the renderer may assign an internal ID."
        }
      },
      required: ["component"]
    },
    CatalogComponentCommon: {
      type: "object",
      properties: {
        weight: {
          type: "number",
          description: "The relative weight of this component within a Row or Column. This is similar to the CSS 'flex-grow' property. Note: this may ONLY be set when the component is a direct descendant of a Row or Column."
        }
      }
    },
    DynamicString: {
      oneOf: [
        { type: "string" },
        { type: "object", properties: { path: { type: "string" } }, required: ["path"], additionalProperties: false },
        { type: "object", properties: { call: { type: "string" }, args: { type: "object" } }, required: ["call"], additionalProperties: true }
      ]
    },
    DynamicNumber: {
      oneOf: [
        { type: "number" },
        { type: "object", properties: { path: { type: "string" } }, required: ["path"], additionalProperties: false },
        { type: "object", properties: { call: { type: "string" }, args: { type: "object" } }, required: ["call"], additionalProperties: true }
      ]
    },
    DynamicBoolean: {
      oneOf: [
        { type: "boolean" },
        { type: "object", properties: { path: { type: "string" } }, required: ["path"], additionalProperties: false },
        { type: "object", properties: { call: { type: "string" }, args: { type: "object" } }, required: ["call"], additionalProperties: true }
      ]
    },
    DynamicStringList: {
      oneOf: [
        { type: "array", items: { type: "string" } },
        { type: "object", properties: { path: { type: "string" } }, required: ["path"], additionalProperties: false },
        { type: "object", properties: { call: { type: "string" }, args: { type: "object" } }, required: ["call"], additionalProperties: true }
      ]
    },
    DynamicValue: {
      oneOf: [
        { type: ["string", "number", "boolean", "object", "array", "null"] },
        { type: "object", properties: { path: { type: "string" } }, required: ["path"], additionalProperties: false },
        { type: "object", properties: { call: { type: "string" }, args: { type: "object" } }, required: ["call"], additionalProperties: true }
      ]
    },
    ComponentId: {
      type: "string",
      description: "A reference to the ID of another component in the components block."
    },
    ChildList: {
      oneOf: [
        {
          type: "array",
          items: { "$ref": "#/$defs/ComponentId" }
        },
        {
          type: "object",
          properties: {
            path: { type: "string", description: "JSON Pointer path to an array in the data model." },
            componentId: { type: "string", description: "The ID of the template component to render for each item." }
          },
          required: ["path", "componentId"],
          additionalProperties: false
        }
      ]
    },
    Action: {
      type: "object",
      properties: {
        event: {
          type: "object",
          properties: {
            name: { type: "string" },
            context: { type: "object" }
          },
          required: ["name"]
        },
        functionCall: {
          type: "object",
          properties: {
            call: { type: "string" },
            args: { type: "object" }
          },
          required: ["call"]
        }
      },
      oneOf: [
        { required: ["event"] },
        { required: ["functionCall"] }
      ],
      additionalProperties: false
    },
    Checkable: {
      type: "object",
      properties: {
        checks: {
          type: "array",
          description: "An optional list of function calls that return a boolean to evaluate the validity or disabled state of the component.",
          items: {
            type: "object",
            properties: {
              call: { type: "string" },
              args: { type: "object" },
              errorMessage: { type: "string" },
              disableOnFail: { type: "boolean", default: false }
            },
            required: ["call"]
          }
        }
      }
    }
  }
};

function getRegisteredComponents() {
  const defaultCatalogPath = path.join(rootDir, 'src', 'core', 'defaultCatalog.ts');
  if (!fs.existsSync(defaultCatalogPath)) {
    throw new Error(`Could not find defaultCatalog.ts at ${defaultCatalogPath}`);
  }

  const content = fs.readFileSync(defaultCatalogPath, 'utf-8');
  
  // Use regex to extract the object keys inside registerAll({ ... })
  const match = content.match(/defaultRegistry\.registerAll\([^,]+,\s*\{([\s\S]*?)\}\s*\);/);
  if (!match) {
    throw new Error("Could not parse defaultRegistry.registerAll call in defaultCatalog.ts");
  }

  const objectBody = match[1];
  const keys = [];
  
  // Split by line and extract the key before the colon
  const lines = objectBody.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;
    
    const parts = trimmed.split(':');
    if (parts.length > 1) {
      const key = parts[0].trim();
      keys.push(key);
    }
  }

  return keys;
}

function validateCatalog() {
  const registeredKeys = getRegisteredComponents();
  const catalogKeys = Object.keys(catalog.components);

  if (process.argv.includes('--test-fail')) {
    catalogKeys.pop(); // Remove one to force mismatch
  }

  const missingInCatalog = registeredKeys.filter(k => !catalogKeys.includes(k));
  const extraInCatalog = catalogKeys.filter(k => !registeredKeys.includes(k));

  if (missingInCatalog.length > 0 || extraInCatalog.length > 0) {
    console.error('Validation Error: Catalog components do not match registered components in defaultCatalog.ts');
    if (missingInCatalog.length > 0) {
      console.error(`Missing in catalog schema: ${missingInCatalog.join(', ')}`);
    }
    if (extraInCatalog.length > 0) {
      console.error(`Extra in catalog schema (not registered): ${extraInCatalog.join(', ')}`);
    }
    process.exit(1);
  }
}

function main() {
  validateCatalog();

  if (!fs.existsSync(catalogDir)) {
    fs.mkdirSync(catalogDir, { recursive: true });
  }
  
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`Generated catalog at ${catalogPath}`);
}

main();
