---
id: 'Label group'
beta: true
section: components
cssPrefix: pf-c-label-group
---## Examples

### Basic

```html
<div class="pf-c-label-group">
  <div class="pf-c-label-group__main">
    <ul class="pf-c-label-group__list" role="list" aria-label="Group of labels">
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-blue">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 2</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-green">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 3</span>
        </span>
      </li>
    </ul>
  </div>
</div>
```

### Overflow

```html
<div class="pf-c-label-group">
  <div class="pf-c-label-group__main">
    <ul class="pf-c-label-group__list" role="list" aria-label="Group of labels">
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-blue">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 2</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-green">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 3</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <button class="pf-c-label pf-m-overflow">
          <span class="pf-c-label__content">3 more</span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### Overflow expanded

```html
<div class="pf-c-label-group">
  <div class="pf-c-label-group__main">
    <ul class="pf-c-label-group__list" role="list" aria-label="Group of labels">
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-blue">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 2</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-green">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 3</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-cyan">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 3</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-purple">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 3</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <button class="pf-c-label pf-m-overflow">
          <span class="pf-c-label__content">3 less</span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### Category

```html
<div class="pf-c-label-group pf-m-category">
  <div class="pf-c-label-group__main">
    <span class="pf-c-label-group__label" aria-hidden="true" id="label-group-category-label">Group label</span>
    <ul class="pf-c-label-group__list" role="list" aria-labelledby="label-group-category-label">
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-blue">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 2</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-green">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 3</span>
        </span>
      </li>
    </ul>
  </div>
</div>
```

### Category removable

```html
<div class="pf-c-label-group pf-m-category">
  <div class="pf-c-label-group__main">
    <span class="pf-c-label-group__label" aria-hidden="true" id="label-group-category-removable-label">Group label</span>
    <ul class="pf-c-label-group__list" role="list" aria-labelledby="label-group-category-removable-label">
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-blue">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 2</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-green">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 3</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-cyan">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 4</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-orange">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 5</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-red">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 6</span>
        </span>
      </li>
    </ul>
  </div>
  <div class="pf-c-label-group__close">
    <button class="pf-c-button pf-m-plain" type="button" aria-labelledby="label-group-category-removable-button label-group-category-removable-label" aria-label="Close label group" id="label-group-category-removable-button">
      <i class="fas fa-times-circle" aria-hidden="true"></i>
    </button>
  </div>
</div>
```

### Vertical

```html
<div class="pf-c-label-group pf-m-vertical">
  <div class="pf-c-label-group__main">
    <ul class="pf-c-label-group__list" role="list" aria-label="Group of labels">
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-blue">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 2</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-green">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 3</span>
        </span>
      </li>
    </ul>
  </div>
</div>
```

### Vertical overflow

```html
<div class="pf-c-label-group pf-m-vertical">
  <div class="pf-c-label-group__main">
    <ul class="pf-c-label-group__list" role="list" aria-label="Group of labels">
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-blue">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 2</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-green">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 3</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <button class="pf-c-label pf-m-overflow">
          <span class="pf-c-label__content">3 more</span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### Vertical overflow expanded

```html
<div class="pf-c-label-group pf-m-vertical">
  <div class="pf-c-label-group__main">
    <ul class="pf-c-label-group__list" role="list" aria-label="Group of labels">
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-blue">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 2</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-green">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 3</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-cyan">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 3</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-purple">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 3</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <button class="pf-c-label pf-m-overflow">
          <span class="pf-c-label__content">3 less</span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### Vertical category

```html
<div class="pf-c-label-group pf-m-vertical pf-m-category">
  <div class="pf-c-label-group__main">
    <span class="pf-c-label-group__label" aria-hidden="true" id="label-group-vertical-category-label">Group label</span>
    <ul class="pf-c-label-group__list" role="list" aria-labelledby="label-group-vertical-category-label">
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-blue">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 2</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-green">
          <span class="pf-c-label__content">
            <span class="pf-c-label__icon">
              <i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>
            </span>Label 3</span>
        </span>
      </li>
    </ul>
  </div>
</div>
```

### Vertical category removable

```html
<div class="pf-c-label-group pf-m-vertical pf-m-category">
  <div class="pf-c-label-group__main">
    <span class="pf-c-label-group__label" aria-hidden="true" id="label-group-vertical-category-removable-label">Group label</span>
    <ul class="pf-c-label-group__list" role="list" aria-labelledby="label-group-vertical-category-removable-label">
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label">
          <span class="pf-c-label__content">Label</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-blue">
          <span class="pf-c-label__content">Label 2</span>
        </span>
      </li>
      <li class="pf-c-label-group__list-item">
        <span class="pf-c-label pf-m-green">
          <span class="pf-c-label__content">Label 3</span>
        </span>
      </li>
    </ul>
  </div>
  <div class="pf-c-label-group__close">
    <button class="pf-c-button pf-m-plain" type="button" aria-labelledby="label-group-vertical-category-removable-button label-group-vertical-category-removable-label" aria-label="Close label group" id="label-group-vertical-category-removable-button">
      <i class="fas fa-times-circle" aria-hidden="true"></i>
    </button>
  </div>
</div>
```

### Accessibility

| Attribute                                                                                                  | Applied to                          | Outcome                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `role="list"`                                                                                              | `.pf-c-label-group__list`           | Indicates that the label group list is a list element. This role is redundant since `.pf-c-label-group__list` is a `<ul>` but is required for screen readers to announce the list propertly. **Required** |
| `aria-label="[button label text]"`                                                                         | `.pf-c-label-group__close > button` | Provides an accessible name for a label group close button when an icon is used instead of text. Required when an icon is used with no supporting text. **Required**                                      |
| `aria-labelledby="[id value of .pf-c-label-group__close > button] [id value of .pf-c-label-group__label]"` | `.pf-c-label-group__close > button` | Provides an accessible name for the button. **Required**                                                                                                                                                  |

### Usage

| Class                          | Applied to                          | Outcome                                                                                     |
| ------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `.pf-c-label-group`            | `<div>`                             | Initiates the label group component. **Required.**                                          |
| `.pf-c-label-group__list`      | `<ul>`                              | Initiates the container for a list of labels. **Required.**                                 |
| `.pf-c-label-group__list-item` | `<li>`                              | Initiates the list item inside of the label group. **Required.**                            |
| `.pf-c-label-group__main`      | `<div>`                             | Initiates the main element in the label group. **Required when label and list are present** |
| `.pf-c-label-group__label`     | `<span>`                            | Initiates the label to be used in the label group.                                          |
| `.pf-c-label-group__close`     | `<div>`                             | Initiates the container used for the button to remove the label group.                      |
| `.pf-c-button`                 | `.pf-c-label-group__close <button>` | Initiates the button used to remove the label group.                                        |
| `.pf-m-category`               | `.pf-c-label-group`                 | Modifies the label group to support category styling.                                       |
