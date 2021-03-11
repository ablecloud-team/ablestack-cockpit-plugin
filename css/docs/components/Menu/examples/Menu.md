---
id: Menu
section: components
beta: true
cssPrefix: pf-c-menu
---import './Menu.css'

## Examples

### Basic

```html
<div class="pf-c-menu">
  <div class="pf-c-menu__content">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Action</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <a class="pf-c-menu__item" href="#">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Link</span>
          </span>
        </a>
      </li>
      <li class="pf-c-menu__list-item pf-m-disabled ">
        <button class="pf-c-menu__item" type="button" disabled>
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Disabled action</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item pf-m-disabled ">
        <a class="pf-c-menu__item" href="#" aria-disabled="true" tabindex="-1">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Disabled link</span>
          </span>
        </a>
      </li>
    </ul>
  </div>
</div>
```

### With icons

```html
<div class="pf-c-menu">
  <div class="pf-c-menu__content">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-icon">
              <i class="fas fa-fw fa-code-branch" aria-hidden="true"></i>
            </span>
            <span class="pf-c-menu__item-text">From Git</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-icon">
              <i class="fas fa-fw fa-layer-group" aria-hidden="true"></i>
            </span>
            <span class="pf-c-menu__item-text">Container image</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-icon">
              <i class="fas fa-fw fa-cube" aria-hidden="true"></i>
            </span>
            <span class="pf-c-menu__item-text">From DockerFile</span>
          </span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### With expanded toggle

```html
<div class="pf-c-menu">
  <div class="pf-c-menu__content">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">From Git</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item pf-m-disabled ">
        <button class="pf-c-menu__item" type="button" disabled>
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Container image</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-icon">
              <i class="fas fa-fw fa-cube" aria-hidden="true"></i>
            </span>
            <span class="pf-c-menu__item-text">From DockerFile</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
          <span class="pf-c-menu__item-description">Description</span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### With flyout

```html
<div class="pf-c-menu pf-m-flyout">
  <div class="pf-c-menu__content">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Start rollout</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Pause rollouts</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button" aria-expanded="false">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Add storage</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu" hidden>
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Application grouping</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Count</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Labels</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Annotations</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button" aria-expanded="true">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Edit</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
          <span class="pf-c-menu__item-description">Description</span>
        </button>
        <div class="pf-c-menu">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Application grouping</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Count</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Labels</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Annotations</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Delete deployment config</span>
          </span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### Drilldown

```html
<div class="pf-c-menu pf-m-drilldown">
  <div class="pf-c-menu__content">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Start rollout</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Pause rollout</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Add storage</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button" aria-expanded="false">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Edit</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" tabindex="0">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-left"></i>
                    </span>
                    <span class="pf-c-menu__item-text">Edit</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-divider" role="separator"></li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Deployment</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button" tabindex="0">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Deployment</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Routes</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Nodes</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">URLs</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button" aria-expanded="false">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Advanced settings</span>
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-right"></i>
                            </span>
                          </span>
                        </button>
                        <div class="pf-c-menu">
                          <div class="pf-c-menu__content">
                            <ul class="pf-c-menu__list">
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button" tabindex="0">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-toggle-icon">
                                      <i class="fas fa-angle-left"></i>
                                    </span>
                                    <span class="pf-c-menu__item-text">Advanced settings</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-divider" role="separator"></li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Reports</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Policies</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Systems</span>
                                  </span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">RBAC</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">RBAC</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Reports</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Policies</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Systems</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Thing with a longer label</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button" aria-expanded="false">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Configuration</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-left"></i>
                    </span>
                    <span class="pf-c-menu__item-text">Configuration</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-divider" role="separator"></li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Profile</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Profile</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Avatar</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Name</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Title</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Time zone</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Account settings</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Thing with a longer label</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Edit access settings</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Edit access settings</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Global access</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Account access</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ul>
  </div>
</div>
```

### Drilldown level two

```html
<div class="pf-c-menu pf-m-drilldown pf-m-drilled-in">
  <div class="pf-c-menu__content" style="--pf-c-menu__content--Height: 177px">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Start rollout</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Pause rollout</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Add storage</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item pf-m-current-path ">
        <button class="pf-c-menu__item" type="button" aria-expanded="true">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Edit</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" tabindex="0">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-left"></i>
                    </span>
                    <span class="pf-c-menu__item-text">Edit</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-divider" role="separator"></li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Deployment</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button" tabindex="0">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Deployment</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Routes</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Nodes</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">URLs</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button" aria-expanded="false">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Advanced settings</span>
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-right"></i>
                            </span>
                          </span>
                        </button>
                        <div class="pf-c-menu">
                          <div class="pf-c-menu__content">
                            <ul class="pf-c-menu__list">
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button" tabindex="0">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-toggle-icon">
                                      <i class="fas fa-angle-left"></i>
                                    </span>
                                    <span class="pf-c-menu__item-text">Advanced settings</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-divider" role="separator"></li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Reports</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Policies</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Systems</span>
                                  </span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">RBAC</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">RBAC</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Reports</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Policies</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Systems</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Thing with a longer label</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button" aria-expanded="false">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Configuration</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-left"></i>
                    </span>
                    <span class="pf-c-menu__item-text">Configuration</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-divider" role="separator"></li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Profile</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Profile</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Avatar</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Name</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Title</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Time zone</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Account settings</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Thing with a longer label</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Edit access settings</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Edit access settings</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Global access</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Account access</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ul>
  </div>
</div>
```

### Drilldown level three

```html
<div class="pf-c-menu pf-m-drilldown pf-m-drilled-in">
  <div class="pf-c-menu__content" style="--pf-c-menu__content--Height: 217px">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Start rollout</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Pause rollout</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Add storage</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item pf-m-current-path ">
        <button class="pf-c-menu__item" type="button" aria-expanded="true">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Edit</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu pf-m-drilled-in">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" tabindex="0">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-left"></i>
                    </span>
                    <span class="pf-c-menu__item-text">Edit</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-divider" role="separator"></li>
              <li class="pf-c-menu__list-item pf-m-current-path ">
                <button class="pf-c-menu__item" type="button" aria-expanded="true">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Deployment</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button" tabindex="0">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Deployment</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Routes</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Nodes</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">URLs</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button" aria-expanded="false">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Advanced settings</span>
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-right"></i>
                            </span>
                          </span>
                        </button>
                        <div class="pf-c-menu">
                          <div class="pf-c-menu__content">
                            <ul class="pf-c-menu__list">
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button" tabindex="0">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-toggle-icon">
                                      <i class="fas fa-angle-left"></i>
                                    </span>
                                    <span class="pf-c-menu__item-text">Advanced settings</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-divider" role="separator"></li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Reports</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Policies</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Systems</span>
                                  </span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">RBAC</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">RBAC</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Reports</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Policies</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Systems</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Thing with a longer label</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button" aria-expanded="false">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Configuration</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-left"></i>
                    </span>
                    <span class="pf-c-menu__item-text">Configuration</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-divider" role="separator"></li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Profile</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Profile</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Avatar</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Name</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Title</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Time zone</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Account settings</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Thing with a longer label</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Edit access settings</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Edit access settings</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Global access</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Account access</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ul>
  </div>
</div>
```

### Drilldown level four

```html
<div class="pf-c-menu pf-m-drilldown pf-m-drilled-in">
  <div class="pf-c-menu__content" style="--pf-c-menu__content--Height: 177px">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Start rollout</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Pause rollout</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Add storage</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item pf-m-current-path ">
        <button class="pf-c-menu__item" type="button" aria-expanded="true">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Edit</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu pf-m-drilled-in">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" tabindex="0">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-left"></i>
                    </span>
                    <span class="pf-c-menu__item-text">Edit</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-divider" role="separator"></li>
              <li class="pf-c-menu__list-item pf-m-current-path ">
                <button class="pf-c-menu__item" type="button" aria-expanded="true">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Deployment</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu pf-m-drilled-in">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button" tabindex="0">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Deployment</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Routes</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Nodes</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">URLs</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item pf-m-current-path ">
                        <button class="pf-c-menu__item" type="button" aria-expanded="true">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Advanced settings</span>
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-right"></i>
                            </span>
                          </span>
                        </button>
                        <div class="pf-c-menu">
                          <div class="pf-c-menu__content">
                            <ul class="pf-c-menu__list">
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button" tabindex="0">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-toggle-icon">
                                      <i class="fas fa-angle-left"></i>
                                    </span>
                                    <span class="pf-c-menu__item-text">Advanced settings</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-divider" role="separator"></li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Reports</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Policies</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Systems</span>
                                  </span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">RBAC</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">RBAC</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Reports</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Policies</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Systems</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Thing with a longer label</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button" aria-expanded="false">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Configuration</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-left"></i>
                    </span>
                    <span class="pf-c-menu__item-text">Configuration</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-divider" role="separator"></li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Profile</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Profile</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Avatar</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Name</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Title</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Time zone</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Account settings</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Thing with a longer label</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Edit access settings</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Edit access settings</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Global access</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Account access</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ul>
  </div>
</div>
```

### Width modified drilldown

```html
<div class="pf-c-menu pf-m-drilldown" style="--pf-c-menu--Width: 350px;">
  <div class="pf-c-menu__content">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Start rollout</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Pause rollout</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Add storage</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button" aria-expanded="false">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Edit</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" tabindex="0">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-left"></i>
                    </span>
                    <span class="pf-c-menu__item-text">Edit</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-divider" role="separator"></li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Deployment</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button" tabindex="0">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Deployment</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Routes</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Nodes</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">URLs</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button" aria-expanded="false">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Advanced settings</span>
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-right"></i>
                            </span>
                          </span>
                        </button>
                        <div class="pf-c-menu">
                          <div class="pf-c-menu__content">
                            <ul class="pf-c-menu__list">
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button" tabindex="0">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-toggle-icon">
                                      <i class="fas fa-angle-left"></i>
                                    </span>
                                    <span class="pf-c-menu__item-text">Advanced settings</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-divider" role="separator"></li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Reports</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Policies</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Systems</span>
                                  </span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">RBAC</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">RBAC</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Reports</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Policies</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Systems</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Thing with a longer label</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button" aria-expanded="false">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Configuration</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-left"></i>
                    </span>
                    <span class="pf-c-menu__item-text">Configuration</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-divider" role="separator"></li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Profile</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Profile</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Avatar</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Name</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Title</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Time zone</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Account settings</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Thing with a longer label</span>
                  </span>
                </button>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Edit access settings</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-left"></i>
                            </span>
                            <span class="pf-c-menu__item-text">Edit access settings</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-divider" role="separator"></li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Global access</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Account access</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ul>
  </div>
</div>
```

### Drilldown with breadcrumbs - level 1

```html
<div class="pf-c-menu pf-m-drilldown">
  <div class="pf-c-menu__content">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button" aria-expanded="false">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Edit</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Deployment</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button" aria-expanded="false">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Labels</span>
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-right"></i>
                            </span>
                          </span>
                        </button>
                        <div class="pf-c-menu">
                          <div class="pf-c-menu__content">
                            <ul class="pf-c-menu__list">
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 1</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 2</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 3</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 4</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 5</span>
                                  </span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">URLs</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">APIs</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Config</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Start rollout</span>
          </span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### Drilldown with breadcrumbs - level 2

```html
<div class="pf-c-menu pf-m-drilldown pf-m-drilled-in">
  <div class="pf-c-menu__breadcrumb">
    <nav class="pf-c-breadcrumb" aria-label="breadcrumb">
      <ol class="pf-c-breadcrumb__list">
        <li class="pf-c-breadcrumb__item">
          <span class="pf-c-breadcrumb__item-divider">
            <i class="fas fa-angle-right" aria-hidden="true"></i>
          </span>
          <button class="pf-c-breadcrumb__link">All</button>
        </li>
        <li class="pf-c-breadcrumb__item">
          <span class="pf-c-breadcrumb__item-divider">
            <i class="fas fa-angle-right" aria-hidden="true"></i>
          </span>
          <h1 class="pf-c-breadcrumb__heading">
            <a href="#" class="pf-c-breadcrumb__link pf-m-current" aria-current="page">Edit</a>
          </h1>
        </li>
      </ol>
    </nav>
  </div>
  <hr class="pf-c-divider" />
  <div class="pf-c-menu__content" style="--pf-c-menu__content--Height: 80px">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item pf-m-current-path ">
        <button class="pf-c-menu__item" type="button" aria-expanded="false">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Edit</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Deployment</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button" aria-expanded="false">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Labels</span>
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-right"></i>
                            </span>
                          </span>
                        </button>
                        <div class="pf-c-menu">
                          <div class="pf-c-menu__content">
                            <ul class="pf-c-menu__list">
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 1</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 2</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 3</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 4</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 5</span>
                                  </span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">URLs</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">APIs</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Config</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Start rollout</span>
          </span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### Drilldown with breadcrumbs - level 3

```html
<div class="pf-c-menu pf-m-drilldown pf-m-drilled-in">
  <div class="pf-c-menu__breadcrumb">
    <nav class="pf-c-breadcrumb" aria-label="breadcrumb">
      <ol class="pf-c-breadcrumb__list">
        <li class="pf-c-breadcrumb__item">
          <span class="pf-c-breadcrumb__item-divider">
            <i class="fas fa-angle-right" aria-hidden="true"></i>
          </span>
          <button class="pf-c-breadcrumb__link">All</button>
        </li>
        <li class="pf-c-breadcrumb__item">
          <span class="pf-c-breadcrumb__item-divider">
            <i class="fas fa-angle-right" aria-hidden="true"></i>
          </span>
          <span class="pf-c-breadcrumb__dropdown">
            <div class="pf-c-dropdown">
              <button class="pf-c-dropdown__toggle pf-m-plain" id="drilldown-with-breadcrumbs-level-3-breadcrumb-breadcrumb-dropdown-button" aria-expanded="false" type="button">
                <span class="pf-c-badge pf-m-read">1
                  <span class="pf-c-dropdown__toggle-icon">
                    <i class="fas fa-caret-down" aria-hidden="true"></i>
                  </span>
                </span>
              </button>
              <div class="pf-c-menu">
                <div class="pf-c-menu__content">
                  <ul class="pf-c-menu__list">
                    <li class="pf-c-menu__list-item ">
                      <button class="pf-c-menu__item" type="button">
                        <span class="pf-c-menu__item-main">
                          <span class="pf-c-menu__item-toggle-icon">
                            <i class="fas fa-angle-left"></i>
                          </span>
                          <span class="pf-c-menu__item-text">Edit</span>
                        </span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </span>
        </li>
        <li class="pf-c-breadcrumb__item">
          <span class="pf-c-breadcrumb__item-divider">
            <i class="fas fa-angle-right" aria-hidden="true"></i>
          </span>
          <h1 class="pf-c-breadcrumb__heading">
            <a href="#" class="pf-c-breadcrumb__link pf-m-current" aria-current="page">Deployment</a>
          </h1>
        </li>
      </ol>
    </nav>
  </div>
  <hr class="pf-c-divider" />
  <div class="pf-c-menu__content" style="--pf-c-menu__content--Height: 120px">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item pf-m-current-path ">
        <button class="pf-c-menu__item" type="button" aria-expanded="false">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Edit</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu pf-m-drilled-in">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item pf-m-current-path ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Deployment</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button" aria-expanded="false">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Labels</span>
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-right"></i>
                            </span>
                          </span>
                        </button>
                        <div class="pf-c-menu">
                          <div class="pf-c-menu__content">
                            <ul class="pf-c-menu__list">
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 1</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 2</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 3</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 4</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 5</span>
                                  </span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">URLs</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">APIs</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Config</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Start rollout</span>
          </span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### Drilldown with breadcrumbs - level 4

```html
<div class="pf-c-menu pf-m-drilldown pf-m-drilled-in">
  <div class="pf-c-menu__breadcrumb">
    <nav class="pf-c-breadcrumb" aria-label="breadcrumb">
      <ol class="pf-c-breadcrumb__list">
        <li class="pf-c-breadcrumb__item">
          <span class="pf-c-breadcrumb__item-divider">
            <i class="fas fa-angle-right" aria-hidden="true"></i>
          </span>
          <button class="pf-c-breadcrumb__link">All</button>
        </li>
        <li class="pf-c-breadcrumb__item">
          <span class="pf-c-breadcrumb__item-divider">
            <i class="fas fa-angle-right" aria-hidden="true"></i>
          </span>
          <span class="pf-c-breadcrumb__dropdown">
            <div class="pf-c-dropdown">
              <button class="pf-c-dropdown__toggle pf-m-plain" id="drilldown-with-breadcrumbs-level-4-breadcrumb-breadcrumb-dropdown-button" aria-expanded="false" type="button">
                <span class="pf-c-badge pf-m-read">2
                  <span class="pf-c-dropdown__toggle-icon">
                    <i class="fas fa-caret-down" aria-hidden="true"></i>
                  </span>
                </span>
              </button>
              <div class="pf-c-menu" style="--pf-c-menu--m-drilldown--Width: 200px;">
                <div class="pf-c-menu__content">
                  <ul class="pf-c-menu__list">
                    <li class="pf-c-menu__list-item ">
                      <button class="pf-c-menu__item" type="button">
                        <span class="pf-c-menu__item-main">
                          <span class="pf-c-menu__item-toggle-icon">
                            <i class="fas fa-angle-left"></i>
                          </span>
                          <span class="pf-c-menu__item-text">Edit</span>
                        </span>
                      </button>
                    </li>
                    <li class="pf-c-menu__list-item ">
                      <button class="pf-c-menu__item" type="button">
                        <span class="pf-c-menu__item-main">
                          <span class="pf-c-menu__item-toggle-icon">
                            <i class="fas fa-angle-left"></i>
                          </span>
                          <span class="pf-c-menu__item-text">Deployment</span>
                        </span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </span>
        </li>
        <li class="pf-c-breadcrumb__item">
          <span class="pf-c-breadcrumb__item-divider">
            <i class="fas fa-angle-right" aria-hidden="true"></i>
          </span>
          <h1 class="pf-c-breadcrumb__heading">
            <a href="#" class="pf-c-breadcrumb__link pf-m-current" aria-current="page">Labels</a>
          </h1>
        </li>
      </ol>
    </nav>
  </div>
  <hr class="pf-c-divider" />
  <div class="pf-c-menu__content" style="--pf-c-menu__content--Height: 200px">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item pf-m-current-path ">
        <button class="pf-c-menu__item" type="button" aria-expanded="false">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Edit</span>
            <span class="pf-c-menu__item-toggle-icon">
              <i class="fas fa-angle-right"></i>
            </span>
          </span>
        </button>
        <div class="pf-c-menu pf-m-drilled-in">
          <div class="pf-c-menu__content">
            <ul class="pf-c-menu__list">
              <li class="pf-c-menu__list-item pf-m-current-path ">
                <button class="pf-c-menu__item" type="button" aria-expanded="false">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Deployment</span>
                    <span class="pf-c-menu__item-toggle-icon">
                      <i class="fas fa-angle-right"></i>
                    </span>
                  </span>
                </button>
                <div class="pf-c-menu pf-m-drilled-in">
                  <div class="pf-c-menu__content">
                    <ul class="pf-c-menu__list">
                      <li class="pf-c-menu__list-item pf-m-current-path ">
                        <button class="pf-c-menu__item" type="button" aria-expanded="false">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">Labels</span>
                            <span class="pf-c-menu__item-toggle-icon">
                              <i class="fas fa-angle-right"></i>
                            </span>
                          </span>
                        </button>
                        <div class="pf-c-menu">
                          <div class="pf-c-menu__content">
                            <ul class="pf-c-menu__list">
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 1</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 2</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 3</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 4</span>
                                  </span>
                                </button>
                              </li>
                              <li class="pf-c-menu__list-item ">
                                <button class="pf-c-menu__item" type="button">
                                  <span class="pf-c-menu__item-main">
                                    <span class="pf-c-menu__item-text">Label 5</span>
                                  </span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">URLs</span>
                          </span>
                        </button>
                      </li>
                      <li class="pf-c-menu__list-item ">
                        <button class="pf-c-menu__item" type="button">
                          <span class="pf-c-menu__item-main">
                            <span class="pf-c-menu__item-text">APIs</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li class="pf-c-menu__list-item ">
                <button class="pf-c-menu__item" type="button">
                  <span class="pf-c-menu__item-main">
                    <span class="pf-c-menu__item-text">Config</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Start rollout</span>
          </span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### With filtering

```html
<div class="pf-c-menu">
  <div class="pf-c-menu__search">
    <div class="pf-c-menu__search-input">
      <input class="pf-c-form-control pf-m-search" type="search" id="-search-input" name="-search-input" aria-label="Search" />
    </div>
  </div>
  <hr class="pf-c-divider" />
  <div class="pf-c-menu__content">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Action 1</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Action 2</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Action 3</span>
          </span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### With links

```html
<div class="pf-c-menu">
  <div class="pf-c-menu__content">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <a class="pf-c-menu__item" href="#" target="_blank">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Link 1</span>
            <span class="pf-c-menu__item-external-icon">
              <i class="fas fa-external-link-alt" aria-hidden="true"></i>
            </span>
            <span class="pf-screen-reader">(opens new window)</span>
          </span>
        </a>
      </li>
      <li class="pf-c-menu__list-item ">
        <a class="pf-c-menu__item" href="#" target="_blank">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Link 2</span>
            <span class="pf-c-menu__item-external-icon">
              <i class="fas fa-external-link-alt" aria-hidden="true"></i>
            </span>
            <span class="pf-screen-reader">(opens new window)</span>
          </span>
        </a>
      </li>
      <li class="pf-c-menu__list-item ">
        <a class="pf-c-menu__item" href="#">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Link 3</span>
          </span>
        </a>
      </li>
    </ul>
  </div>
</div>
```

### With separator(s)

```html
<div class="pf-c-menu">
  <div class="pf-c-menu__content">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Action 1</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Action 2</span>
          </span>
        </button>
      </li>
      <li class="pf-c-divider" role="separator"></li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Action 3</span>
          </span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### With titled groups

```html
<div class="pf-c-menu">
  <div class="pf-c-menu__content">
    <section class="pf-c-menu__group">
      <ul class="pf-c-menu__list">
        <li class="pf-c-menu__list-item ">
          <a class="pf-c-menu__item" href="#">
            <span class="pf-c-menu__item-main">
              <span class="pf-c-menu__item-text">Link not in group</span>
            </span>
          </a>
        </li>
      </ul>
    </section>
    <hr class="pf-c-divider" />
    <section class="pf-c-menu__group">
      <h1 class="pf-c-menu__group-title">Group 1</h1>
      <ul class="pf-c-menu__list">
        <li class="pf-c-menu__list-item ">
          <a class="pf-c-menu__item" href="#">
            <span class="pf-c-menu__item-main">
              <span class="pf-c-menu__item-text">Link 1</span>
            </span>
          </a>
        </li>
        <li class="pf-c-menu__list-item ">
          <a class="pf-c-menu__item" href="#">
            <span class="pf-c-menu__item-main">
              <span class="pf-c-menu__item-text">Link 2</span>
            </span>
          </a>
        </li>
      </ul>
    </section>
    <hr class="pf-c-divider" />
    <section class="pf-c-menu__group">
      <h1 class="pf-c-menu__group-title">Group 2</h1>
      <ul class="pf-c-menu__list">
        <li class="pf-c-menu__list-item ">
          <a class="pf-c-menu__item" href="#">
            <span class="pf-c-menu__item-main">
              <span class="pf-c-menu__item-text">Link 1</span>
            </span>
          </a>
        </li>
        <li class="pf-c-menu__list-item ">
          <a class="pf-c-menu__item" href="#">
            <span class="pf-c-menu__item-main">
              <span class="pf-c-menu__item-text">Link 2</span>
            </span>
          </a>
        </li>
      </ul>
    </section>
  </div>
</div>
```

### With description

```html
<div class="pf-c-menu">
  <div class="pf-c-menu__content">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-icon">
              <i class="fas fa-fw fa-code-branch" aria-hidden="true"></i>
            </span>
            <span class="pf-c-menu__item-text">Action 1</span>
          </span>
          <span class="pf-c-menu__item-description">Description</span>
        </button>
      </li>
      <li class="pf-c-menu__list-item pf-m-disabled ">
        <button class="pf-c-menu__item" type="button" disabled>
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-icon">
              <i class="fas fa-fw fa-code-branch" aria-hidden="true"></i>
            </span>
            <span class="pf-c-menu__item-text">Action 2 disabled</span>
          </span>
          <span class="pf-c-menu__item-description">Description</span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-icon">
              <i class="fas fa-fw fa-code-branch" aria-hidden="true"></i>
            </span>
            <span class="pf-c-menu__item-text">Action 3</span>
          </span>
          <span class="pf-c-menu__item-description">Nunc non ornare ex, et pretium dui. Duis nec augue at urna elementum blandit tincidunt eget metus. Aenean sed metus id urna dignissim interdum. Aenean vel nisl vitae arcu vehicula pulvinar eget nec turpis. Cras sit amet est est.</span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### With actions

```html
<div class="pf-c-menu">
  <div class="pf-c-menu__content">
    <section class="pf-c-menu__group">
      <h1 class="pf-c-menu__group-title">Actions</h1>
      <ul class="pf-c-menu__list">
        <li class="pf-c-menu__list-item ">
          <button class="pf-c-menu__item pf-m-selected" type="button">
            <span class="pf-c-menu__item-main">
              <span class="pf-c-menu__item-text">Item 1</span>
              <span class="pf-c-menu__item-select-icon">
                <i class="fas fa-check" aria-hidden="true"></i>
              </span>
            </span>
            <span class="pf-c-menu__item-description">This is a description</span>
          </button>
          <button class="pf-c-menu__item-action" type="button" aria-label="Actions">
            <span class="pf-c-menu__item-action-icon">
              <i class="fas fa-fw fa-ellipsis-v" aria-hidden="true"></i>
            </span>
          </button>
        </li>
        <li class="pf-c-menu__list-item ">
          <button class="pf-c-menu__item pf-m-select" type="button">
            <span class="pf-c-menu__item-main">
              <span class="pf-c-menu__item-text">Item 2</span>
            </span>
          </button>
          <button class="pf-c-menu__item-action" type="button" aria-label="Alert">
            <span class="pf-c-menu__item-action-icon">
              <i class="fas fa-fw fa-bell" aria-hidden="true"></i>
            </span>
          </button>
        </li>
        <li class="pf-c-menu__list-item pf-m-disabled ">
          <button class="pf-c-menu__item" type="button" disabled>
            <span class="pf-c-menu__item-main">
              <span class="pf-c-menu__item-text">Item 3 disabled</span>
              <span class="pf-c-menu__item-select-icon">
                <i class="fas fa-check" aria-hidden="true"></i>
              </span>
            </span>
            <span class="pf-c-menu__item-description">This is a description</span>
          </button>
          <button class="pf-c-menu__item-action" type="button" disabled aria-label="Copy">
            <span class="pf-c-menu__item-action-icon">
              <i class="fas fa-fw fa-clipboard" aria-hidden="true"></i>
            </span>
          </button>
        </li>
        <li class="pf-c-menu__list-item ">
          <button class="pf-c-menu__item pf-m-selected" type="button">
            <span class="pf-c-menu__item-main">
              <span class="pf-c-menu__item-text">Item 4</span>
              <span class="pf-c-menu__item-select-icon">
                <i class="fas fa-check" aria-hidden="true"></i>
              </span>
            </span>
            <span class="pf-c-menu__item-description">This is a description</span>
          </button>
          <button class="pf-c-menu__item-action" type="button" aria-label="Expand">
            <span class="pf-c-menu__item-action-icon">
              <i class="fas fa-fw fa-bars" aria-hidden="true"></i>
            </span>
          </button>
        </li>
      </ul>
    </section>
  </div>
</div>
```

### With favorites

```html
<div class="pf-c-menu">
  <div class="pf-c-menu__content">
    <section class="pf-c-menu__group">
      <h1 class="pf-c-menu__group-title">Favorites</h1>
      <ul class="pf-c-menu__list">
        <li class="pf-c-menu__list-item ">
          <a class="pf-c-menu__item" href="#">
            <span class="pf-c-menu__item-main">
              <span class="pf-c-menu__item-text">Item 1</span>
            </span>
            <span class="pf-c-menu__item-description">This is a description</span>
          </a>
          <button class="pf-c-menu__item-action pf-m-favorite pf-m-favorited" type="button" aria-label="Starred">
            <span class="pf-c-menu__item-action-icon">
              <i class="fas fa-star" aria-hidden="true"></i>
            </span>
          </button>
        </li>
        <li class="pf-c-menu__list-item ">
          <a class="pf-c-menu__item" href="#" target="_blank">
            <span class="pf-c-menu__item-main">
              <span class="pf-c-menu__item-text">Item 3</span>
              <span class="pf-c-menu__item-external-icon">
                <i class="fas fa-external-link-alt" aria-hidden="true"></i>
              </span>
              <span class="pf-screen-reader">(opens new window)</span>
            </span>
          </a>
          <button class="pf-c-menu__item-action pf-m-favorite" type="button" aria-label="Not starred">
            <span class="pf-c-menu__item-action-icon">
              <i class="fas fa-star" aria-hidden="true"></i>
            </span>
          </button>
        </li>
      </ul>
    </section>
    <hr class="pf-c-divider" />
    <section class="pf-c-menu__group">
      <h1 class="pf-c-menu__group-title">All actions</h1>
      <ul class="pf-c-menu__list">
        <li class="pf-c-menu__list-item ">
          <a class="pf-c-menu__item" href="#">
            <span class="pf-c-menu__item-main">
              <span class="pf-c-menu__item-text">Item 1</span>
            </span>
            <span class="pf-c-menu__item-description">This is a description</span>
          </a>
          <button class="pf-c-menu__item-action pf-m-favorite" type="button" aria-label="Not starred">
            <span class="pf-c-menu__item-action-icon">
              <i class="fas fa-star" aria-hidden="true"></i>
            </span>
          </button>
        </li>
        <li class="pf-c-menu__list-item pf-m-disabled ">
          <a class="pf-c-menu__item" href="#" aria-disabled="true" tabindex="-1" target="_blank">
            <span class="pf-c-menu__item-main">
              <span class="pf-c-menu__item-text">Item 2 disabled</span>
              <span class="pf-c-menu__item-external-icon">
                <i class="fas fa-external-link-alt" aria-hidden="true"></i>
              </span>
              <span class="pf-screen-reader">(opens new window)</span>
            </span>
            <span class="pf-c-menu__item-description">This is a description</span>
          </a>
          <button class="pf-c-menu__item-action pf-m-favorite" type="button" disabled aria-label="Not starred">
            <span class="pf-c-menu__item-action-icon">
              <i class="fas fa-star" aria-hidden="true"></i>
            </span>
          </button>
        </li>
        <li class="pf-c-menu__list-item ">
          <a class="pf-c-menu__item" href="#" target="_blank">
            <span class="pf-c-menu__item-main">
              <span class="pf-c-menu__item-text">Item 3</span>
              <span class="pf-c-menu__item-external-icon">
                <i class="fas fa-external-link-alt" aria-hidden="true"></i>
              </span>
              <span class="pf-screen-reader">(opens new window)</span>
            </span>
          </a>
          <button class="pf-c-menu__item-action pf-m-favorite" type="button" aria-label="Not starred">
            <span class="pf-c-menu__item-action-icon">
              <i class="fas fa-star" aria-hidden="true"></i>
            </span>
          </button>
        </li>
      </ul>
    </section>
  </div>
</div>
```

### Option single select

```html
<div class="pf-c-menu">
  <div class="pf-c-menu__content">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Option 1</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Option 2</span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item pf-m-selected" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-icon">
              <i class="fas fa-fw fa-table" aria-hidden="true"></i>
            </span>
            <span class="pf-c-menu__item-text">Option 3</span>
            <span class="pf-c-menu__item-select-icon">
              <i class="fas fa-check" aria-hidden="true"></i>
            </span>
          </span>
          <span class="pf-c-menu__item-description">Description</span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

### Option multi-select

```html
<div class="pf-c-menu">
  <div class="pf-c-menu__content">
    <ul class="pf-c-menu__list">
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item pf-m-selected" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Option 1</span>
            <span class="pf-c-menu__item-select-icon">
              <i class="fas fa-check" aria-hidden="true"></i>
            </span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item pf-m-selected" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-text">Option 2</span>
            <span class="pf-c-menu__item-select-icon">
              <i class="fas fa-check" aria-hidden="true"></i>
            </span>
          </span>
        </button>
      </li>
      <li class="pf-c-menu__list-item ">
        <button class="pf-c-menu__item pf-m-selected" type="button">
          <span class="pf-c-menu__item-main">
            <span class="pf-c-menu__item-icon">
              <i class="fas fa-fw fa-table" aria-hidden="true"></i>
            </span>
            <span class="pf-c-menu__item-text">Option 3</span>
            <span class="pf-c-menu__item-select-icon">
              <i class="fas fa-check" aria-hidden="true"></i>
            </span>
          </span>
          <span class="pf-c-menu__item-description">Description</span>
        </button>
      </li>
    </ul>
  </div>
</div>
```

## Documentation

### Overview

### Accessibility

| Attribute                  | Applied                                                                                                                                                   | Outcome                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `disabled`                 | `button.pf-c-menu__item`                                                                                                                                  | When the menu item uses a button element, indicates that it is unavailable and removes it from keyboard focus. |
| `aria-disabled="true"`     | `a.pf-c-menu__item`                                                                                                                                       | When the menu item uses a link element, removes it from keyboard focus.                                        |
| `tabindex="-1"`            | `a.pf-c-menu__item`                                                                                                                                       | When the menu item uses a link element, removes it from keyboard focus.                                        |
| `aria-hidden="true"`       | `.pf-c-menu__item-icon`, `.pf-c-menu__item-action-icon`, `.pf-c-menu__item-external-icon`, `.pf-c-menu__item-toggle-icon`, `.pf-c-menu__item-select-icon` | Hides the icon from assistive technologies.                                                                    |
| `aria-label="Not starred"` | `.pf-c-menu__item-action-icon.pf-m-favorite`                                                                                                              | Provides an accessible label indicating that the favorite action is not selected.                              |
| `aria-label="Starred"`     | `.pf-c-menu__item-action-icon.pf-m-favorite.pf-m-favorited`                                                                                               | Provides an accessible label indicating that the favorite action is selected.                                  |

### Usage

| Class                                    | Applied to                                                        | Outcome                                                                         |
| ---------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `.pf-c-menu`                             | `<div>`                                                           | Initiates the menu. **Required**                                                |
| `.pf-c-menu__search`                     | `<div>`                                                           | Initiates the menu search container. Use for filtering.                         |
| `.pf-c-menu__search-input`               | `<div>`                                                           | Initiates the menu search input container.                                      |
| `.pf-c-menu__content`                    | `<div>`                                                           | Initiates the menu content. Use for lists. **Required**                         |
| `.pf-c-menu__list`                       | `<ul>`                                                            | Initiates the menu list. **Required**                                           |
| `.pf-c-menu__list-item`                  | `<li>`                                                            | Initiates the menu list item. **Required**                                      |
| `.pf-c-menu__item`                       | `<button>`, `<a>`, `<div>`                                        | Initiates the menu item. **Required**                                           |
| `.pf-c-menu__item-main`                  | `<span>`                                                          | Initiates the menu item main container. **Required**                            |
| `.pf-c-menu__item-text`                  | `<span>`                                                          | Initiates the menu item text. **Required**                                      |
| `.pf-c-menu__item-description`           | `<span>`                                                          | Initiates the menu item description.                                            |
| `.pf-c-menu__item-group`                 | `<section>`                                                       | Initiates the menu item group.                                                  |
| `.pf-c-menu__item-group-title`           | `<h1>`                                                            | Initiates the menu item group title.                                            |
| `.pf-c-menu__item-icon`                  | `<span>`                                                          | Initiates the menu item icon.                                                   |
| `.pf-c-menu__item-toggle-icon`           | `<span>`                                                          | Initiates the menu item toggle icon.                                            |
| `.pf-c-menu__item-select-icon`           | `<span>`                                                          | Initiates the menu item select icon.                                            |
| `.pf-c-menu__item-action`                | `<button>`                                                        | Initiates the menu item action.                                                 |
| `.pf-c-menu__item-action-icon`           | `<span>`                                                          | Initiates the menu item action icon.                                            |
| `.pf-c-menu__item-external-icon`         | `<span>`                                                          | Initiates the menu item external icon.                                          |
| `.pf-m-favorite`                         | `.pf-c-menu__item-action`                                         | Modifies the menu item action to handle the favorite icon.                      |
| `.pf-m-favorited`                        | `.pf-c-menu__item-action.pf-m-favorite`                           | Modifies the menu item action icon to be favorited.                             |
| `.pf-m-selected`                         | `.pf-c-menu__item`                                                | Modifies the menu item to be selected.                                          |
| `.pf-m-flyout`                           | `.pf-c-menu`                                                      | Modifies the menu so that all nested `.pf-c-menu` elements "flyout".            |
| `.pf-m-drilldown`                        | `.pf-c-menu`                                                      | Modifies the menu so that all nested `.pf-c-menu` elements "drill down".        |
| `.pf-m-current-path`                     | `.pf-c-menu.pf-m-drilldown .pf-c-menu__list-item`                 | Modifies the menu list item for current path state.                             |
| `.pf-m-drilled-in`                       | `.pf-c-menu.pf-m-drilldown, .pf-c-menu.pf-m-drilldown .pf-c-menu` | Modifies the menu list for drilled in state.                                    |
| `--pf-c-menu--Width: {width}`            | `.pf-c-menu`                                                      | Modifies the width of the menu. The default value is `auto`.                    |
| `--pf-c-menu__content--Height: {height}` | `.pf-c-menu.pf-m-drilldown`                                       | Modifies the height of the drilldown menu content. The default value is `auto`. |
