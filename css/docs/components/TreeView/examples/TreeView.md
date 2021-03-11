---
id: Tree view
section: components
cssPrefix: pf-c-tree-view
beta: true
---## Examples

### Default

```html
<div class="pf-c-tree-view">
  <ul class="pf-c-tree-view__list" role="tree">
    <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">Application launcher</span>
        </button>
      </div>
      <ul class="pf-c-tree-view__list" role="group">
        <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
          <div class="pf-c-tree-view__content">
            <button class="pf-c-tree-view__node">
              <div class="pf-c-tree-view__node-toggle">
                <span class="pf-c-tree-view__node-toggle-icon">
                  <i class="fas fa-angle-right" aria-hidden="true"></i>
                </span>
              </div>
              <span class="pf-c-tree-view__node-text">Application 1</span>
            </button>
          </div>
          <ul class="pf-c-tree-view__list" role="group">
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <span class="pf-c-tree-view__node-text">Settings</span>
                </button>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node pf-m-current">
                  <span class="pf-c-tree-view__node-text">Current</span>
                </button>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <div class="pf-c-tree-view__node-toggle">
                    <span class="pf-c-tree-view__node-toggle-icon">
                      <i class="fas fa-angle-right" aria-hidden="true"></i>
                    </span>
                  </div>
                  <span class="pf-c-tree-view__node-text">Loader</span>
                </button>
              </div>
            </li>
          </ul>
        </li>
        <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
          <div class="pf-c-tree-view__content">
            <button class="pf-c-tree-view__node">
              <div class="pf-c-tree-view__node-toggle">
                <span class="pf-c-tree-view__node-toggle-icon">
                  <i class="fas fa-angle-right" aria-hidden="true"></i>
                </span>
              </div>
              <span class="pf-c-tree-view__node-text">Application 2</span>
            </button>
          </div>
          <ul class="pf-c-tree-view__list" role="group">
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <span class="pf-c-tree-view__node-text">Settings</span>
                </button>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <div class="pf-c-tree-view__node-toggle">
                    <span class="pf-c-tree-view__node-toggle-icon">
                      <i class="fas fa-angle-right" aria-hidden="true"></i>
                    </span>
                  </div>
                  <span class="pf-c-tree-view__node-text">Settings</span>
                </button>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <div class="pf-c-tree-view__node-toggle">
                    <span class="pf-c-tree-view__node-toggle-icon">
                      <i class="fas fa-angle-right" aria-hidden="true"></i>
                    </span>
                  </div>
                  <span class="pf-c-tree-view__node-text">Loader</span>
                </button>
              </div>
              <ul class="pf-c-tree-view__list" role="group">
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <div class="pf-c-tree-view__node-toggle">
                        <span class="pf-c-tree-view__node-toggle-icon">
                          <i class="fas fa-angle-right" aria-hidden="true"></i>
                        </span>
                      </div>
                      <span class="pf-c-tree-view__node-text">Loader app 1</span>
                    </button>
                  </div>
                </li>
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <span class="pf-c-tree-view__node-text">Loader app 2</span>
                    </button>
                  </div>
                </li>
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <span class="pf-c-tree-view__node-text">Loader app 3</span>
                    </button>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">Cost management</span>
        </button>
      </div>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">Sources</span>
        </button>
      </div>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">This is a really really really long folder name that overflows from the width of the container.</span>
        </button>
      </div>
    </li>
  </ul>
</div>
```

### With search

```html
<div class="pf-c-tree-view">
  <div class="pf-c-tree-view__search">
    <input class="pf-c-form-control pf-m-search" type="search" id="input-search" name="search-input" aria-label="Search input example" />
  </div>
  <hr class="pf-c-divider" />
  <ul class="pf-c-tree-view__list" role="tree">
    <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">Application launcher</span>
        </button>
      </div>
      <ul class="pf-c-tree-view__list" role="group">
        <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
          <div class="pf-c-tree-view__content">
            <button class="pf-c-tree-view__node">
              <div class="pf-c-tree-view__node-toggle">
                <span class="pf-c-tree-view__node-toggle-icon">
                  <i class="fas fa-angle-right" aria-hidden="true"></i>
                </span>
              </div>
              <span class="pf-c-tree-view__node-text">Application 1</span>
            </button>
          </div>
          <ul class="pf-c-tree-view__list" role="group">
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <span class="pf-c-tree-view__node-text">Settings</span>
                </button>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node pf-m-current">
                  <span class="pf-c-tree-view__node-text">Current</span>
                </button>
              </div>
            </li>
          </ul>
        </li>
        <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
          <div class="pf-c-tree-view__content">
            <button class="pf-c-tree-view__node">
              <div class="pf-c-tree-view__node-toggle">
                <span class="pf-c-tree-view__node-toggle-icon">
                  <i class="fas fa-angle-right" aria-hidden="true"></i>
                </span>
              </div>
              <span class="pf-c-tree-view__node-text">Application 2</span>
            </button>
          </div>
          <ul class="pf-c-tree-view__list" role="group">
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <div class="pf-c-tree-view__node-toggle">
                    <span class="pf-c-tree-view__node-toggle-icon">
                      <i class="fas fa-angle-right" aria-hidden="true"></i>
                    </span>
                  </div>
                  <span class="pf-c-tree-view__node-text">Settings</span>
                </button>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <div class="pf-c-tree-view__node-toggle">
                    <span class="pf-c-tree-view__node-toggle-icon">
                      <i class="fas fa-angle-right" aria-hidden="true"></i>
                    </span>
                  </div>
                  <span class="pf-c-tree-view__node-text">Loader</span>
                </button>
              </div>
              <ul class="pf-c-tree-view__list" role="group">
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <div class="pf-c-tree-view__node-toggle">
                        <span class="pf-c-tree-view__node-toggle-icon">
                          <i class="fas fa-angle-right" aria-hidden="true"></i>
                        </span>
                      </div>
                      <span class="pf-c-tree-view__node-text">Loader app 1</span>
                    </button>
                  </div>
                </li>
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <span class="pf-c-tree-view__node-text">Loader app 2</span>
                    </button>
                  </div>
                </li>
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <span class="pf-c-tree-view__node-text">Loader app 3</span>
                    </button>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">Cost management</span>
        </button>
      </div>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">Sources</span>
        </button>
      </div>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">This is a really really really long folder name that overflows from the width of the container.</span>
        </button>
      </div>
    </li>
  </ul>
</div>
```

### With checkboxes

```html
<div class="pf-c-tree-view">
  <ul class="pf-c-tree-view__list" role="tree">
    <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
      <div class="pf-c-tree-view__content">
        <div class="pf-c-tree-view__node" tabindex="0">
          <button class="pf-c-tree-view__node-toggle" aria-label="Toggle" aria-expanded="true">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </button>
          <span class="pf-c-tree-view__node-check">
            <input type="checkbox" id="check-1" aria-label="Tree view node check" />
          </span>
          <label class="pf-c-tree-view__node-text" for="check-1">Application launcher</label>
        </div>
      </div>
      <ul class="pf-c-tree-view__list" role="group">
        <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
          <div class="pf-c-tree-view__content">
            <div class="pf-c-tree-view__node" tabindex="0">
              <button class="pf-c-tree-view__node-toggle" aria-label="Toggle" aria-expanded="true">
                <span class="pf-c-tree-view__node-toggle-icon">
                  <i class="fas fa-angle-right" aria-hidden="true"></i>
                </span>
              </button>
              <span class="pf-c-tree-view__node-check">
                <input type="checkbox" id="check-2" checked aria-label="Tree view node check checked" />
              </span>
              <label class="pf-c-tree-view__node-text" for="check-2">Application 1</label>
            </div>
          </div>
          <ul class="pf-c-tree-view__list" role="group">
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
              <div class="pf-c-tree-view__content">
                <div class="pf-c-tree-view__node" tabindex="0">
                  <span class="pf-c-tree-view__node-check">
                    <input type="checkbox" id="check-3" checked aria-label="Tree view node check checked" />
                  </span>
                  <label class="pf-c-tree-view__node-text" for="check-3">Settings</label>
                </div>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
              <div class="pf-c-tree-view__content">
                <div class="pf-c-tree-view__node" tabindex="0">
                  <span class="pf-c-tree-view__node-check">
                    <input type="checkbox" id="check-4" checked aria-label="Tree view node check checked" />
                  </span>
                  <label class="pf-c-tree-view__node-text" for="check-4">Loader</label>
                </div>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
              <div class="pf-c-tree-view__content">
                <div class="pf-c-tree-view__node" tabindex="0">
                  <button class="pf-c-tree-view__node-toggle" aria-label="Toggle" aria-expanded="false">
                    <span class="pf-c-tree-view__node-toggle-icon">
                      <i class="fas fa-angle-right" aria-hidden="true"></i>
                    </span>
                  </button>
                  <span class="pf-c-tree-view__node-check">
                    <input type="checkbox" id="check-5" checked aria-label="Tree view node check checked" />
                  </span>
                  <label class="pf-c-tree-view__node-text" for="check-5">Loader</label>
                </div>
              </div>
            </li>
          </ul>
        </li>
        <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
          <div class="pf-c-tree-view__content">
            <div class="pf-c-tree-view__node" tabindex="0">
              <button class="pf-c-tree-view__node-toggle" aria-label="Toggle" aria-expanded="true">
                <span class="pf-c-tree-view__node-toggle-icon">
                  <i class="fas fa-angle-right" aria-hidden="true"></i>
                </span>
              </button>
              <span class="pf-c-tree-view__node-check">
                <input type="checkbox" id="check-6" aria-label="Tree view node check" />
              </span>
              <label class="pf-c-tree-view__node-text" for="check-6">Application 2</label>
            </div>
          </div>
          <ul class="pf-c-tree-view__list" role="group">
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
              <div class="pf-c-tree-view__content">
                <div class="pf-c-tree-view__node" tabindex="0">
                  <button class="pf-c-tree-view__node-toggle" aria-label="Toggle" aria-expanded="false">
                    <span class="pf-c-tree-view__node-toggle-icon">
                      <i class="fas fa-angle-right" aria-hidden="true"></i>
                    </span>
                  </button>
                  <span class="pf-c-tree-view__node-check">
                    <input type="checkbox" id="check-7" aria-label="Tree view node check" />
                  </span>
                  <label class="pf-c-tree-view__node-text" for="check-7">Settings</label>
                </div>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
              <div class="pf-c-tree-view__content">
                <div class="pf-c-tree-view__node" tabindex="0">
                  <span class="pf-c-tree-view__node-check">
                    <input type="checkbox" id="check-8" aria-label="Tree view node check" />
                  </span>
                  <label class="pf-c-tree-view__node-text" for="check-8">Settings</label>
                </div>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
              <div class="pf-c-tree-view__content">
                <div class="pf-c-tree-view__node" tabindex="0">
                  <button class="pf-c-tree-view__node-toggle" aria-label="Toggle" aria-expanded="true">
                    <span class="pf-c-tree-view__node-toggle-icon">
                      <i class="fas fa-angle-right" aria-hidden="true"></i>
                    </span>
                  </button>
                  <span class="pf-c-tree-view__node-check">
                    <input type="checkbox" id="check-9" aria-label="Tree view node check" />
                  </span>
                  <label class="pf-c-tree-view__node-text" for="check-9">Current</label>
                </div>
              </div>
              <ul class="pf-c-tree-view__list" role="group">
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
                  <div class="pf-c-tree-view__content">
                    <div class="pf-c-tree-view__node" tabindex="0">
                      <button class="pf-c-tree-view__node-toggle" aria-label="Toggle" aria-expanded="false">
                        <span class="pf-c-tree-view__node-toggle-icon">
                          <i class="fas fa-angle-right" aria-hidden="true"></i>
                        </span>
                      </button>
                      <span class="pf-c-tree-view__node-check">
                        <input type="checkbox" id="check-10" aria-label="Tree view node check" />
                      </span>
                      <label class="pf-c-tree-view__node-text" for="check-10">Loader app 1</label>
                    </div>
                  </div>
                </li>
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
                  <div class="pf-c-tree-view__content">
                    <div class="pf-c-tree-view__node" tabindex="0">
                      <span class="pf-c-tree-view__node-check">
                        <input type="checkbox" id="check-11" checked aria-label="Tree view node check checked" />
                      </span>
                      <label class="pf-c-tree-view__node-text" for="check-11">Loader app 2</label>
                    </div>
                  </div>
                </li>
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
                  <div class="pf-c-tree-view__content">
                    <div class="pf-c-tree-view__node" tabindex="0">
                      <span class="pf-c-tree-view__node-check">
                        <input type="checkbox" id="check-12" aria-label="Tree view node check" />
                      </span>
                      <label class="pf-c-tree-view__node-text" for="check-12">Loader app 3</label>
                    </div>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <div class="pf-c-tree-view__node" tabindex="0">
          <button class="pf-c-tree-view__node-toggle" aria-label="Toggle" aria-expanded="false">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </button>
          <span class="pf-c-tree-view__node-check">
            <input type="checkbox" id="check-13" aria-label="Tree view node check" />
          </span>
          <label class="pf-c-tree-view__node-text" for="check-13">Cost management</label>
        </div>
      </div>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <div class="pf-c-tree-view__node" tabindex="0">
          <button class="pf-c-tree-view__node-toggle" aria-label="Toggle" aria-expanded="false">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </button>
          <span class="pf-c-tree-view__node-check">
            <input type="checkbox" id="check-14" aria-label="Tree view node check" />
          </span>
          <label class="pf-c-tree-view__node-text" for="check-14">Sources</label>
        </div>
      </div>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <div class="pf-c-tree-view__node" tabindex="0">
          <button class="pf-c-tree-view__node-toggle" aria-label="Toggle" aria-expanded="false">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </button>
          <span class="pf-c-tree-view__node-check">
            <input type="checkbox" id="check-15" checked aria-label="Tree view node check checked" />
          </span>
          <label class="pf-c-tree-view__node-text" for="check-15">This is a really really really long folder name that overflows from the width of the container.</label>
        </div>
      </div>
    </li>
  </ul>
</div>
```

### With icons

```html
<div class="pf-c-tree-view">
  <ul class="pf-c-tree-view__list" role="group">
    <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-icon">
            <i class="fas fa-folder-open" aria-hidden="true"></i>
          </span>
          <span class="pf-c-tree-view__node-text">Application launcher</span>
        </button>
      </div>
      <ul class="pf-c-tree-view__list" role="group">
        <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
          <div class="pf-c-tree-view__content">
            <button class="pf-c-tree-view__node">
              <div class="pf-c-tree-view__node-toggle">
                <span class="pf-c-tree-view__node-toggle-icon">
                  <i class="fas fa-angle-right" aria-hidden="true"></i>
                </span>
              </div>
              <span class="pf-c-tree-view__node-icon">
                <i class="fas fa-folder-open" aria-hidden="true"></i>
              </span>
              <span class="pf-c-tree-view__node-text">Application 1</span>
            </button>
          </div>
          <ul class="pf-c-tree-view__list" role="group">
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <span class="pf-c-tree-view__node-icon">
                    <i class="fas fa-folder" aria-hidden="true"></i>
                  </span>
                  <span class="pf-c-tree-view__node-text">Settings</span>
                </button>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node pf-m-current">
                  <span class="pf-c-tree-view__node-icon">
                    <i class="fas fa-folder" aria-hidden="true"></i>
                  </span>
                  <span class="pf-c-tree-view__node-text">Current</span>
                </button>
              </div>
            </li>
          </ul>
        </li>
        <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
          <div class="pf-c-tree-view__content">
            <button class="pf-c-tree-view__node">
              <div class="pf-c-tree-view__node-toggle">
                <span class="pf-c-tree-view__node-toggle-icon">
                  <i class="fas fa-angle-right" aria-hidden="true"></i>
                </span>
              </div>
              <span class="pf-c-tree-view__node-icon">
                <i class="fas fa-folder-open" aria-hidden="true"></i>
              </span>
              <span class="pf-c-tree-view__node-text">Application 2</span>
            </button>
          </div>
          <ul class="pf-c-tree-view__list" role="group">
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <div class="pf-c-tree-view__node-toggle">
                    <span class="pf-c-tree-view__node-toggle-icon">
                      <i class="fas fa-angle-right" aria-hidden="true"></i>
                    </span>
                  </div>
                  <span class="pf-c-tree-view__node-icon">
                    <i class="fas fa-folder" aria-hidden="true"></i>
                  </span>
                  <span class="pf-c-tree-view__node-text">Settings</span>
                </button>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <div class="pf-c-tree-view__node-toggle">
                    <span class="pf-c-tree-view__node-toggle-icon">
                      <i class="fas fa-angle-right" aria-hidden="true"></i>
                    </span>
                  </div>
                  <span class="pf-c-tree-view__node-icon">
                    <i class="fas fa-folder-open" aria-hidden="true"></i>
                  </span>
                  <span class="pf-c-tree-view__node-text">Loader</span>
                </button>
              </div>
              <ul class="pf-c-tree-view__list" role="group">
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <div class="pf-c-tree-view__node-toggle">
                        <span class="pf-c-tree-view__node-toggle-icon">
                          <i class="fas fa-angle-right" aria-hidden="true"></i>
                        </span>
                      </div>
                      <span class="pf-c-tree-view__node-icon">
                        <i class="fas fa-folder" aria-hidden="true"></i>
                      </span>
                      <span class="pf-c-tree-view__node-text">Loader app 1</span>
                    </button>
                  </div>
                </li>
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <span class="pf-c-tree-view__node-icon">
                        <i class="fas fa-folder" aria-hidden="true"></i>
                      </span>
                      <span class="pf-c-tree-view__node-text">Loader app 2</span>
                    </button>
                  </div>
                </li>
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <span class="pf-c-tree-view__node-icon">
                        <i class="fas fa-folder" aria-hidden="true"></i>
                      </span>
                      <span class="pf-c-tree-view__node-text">Loader app 3</span>
                    </button>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-icon">
            <i class="fas fa-folder" aria-hidden="true"></i>
          </span>
          <span class="pf-c-tree-view__node-text">Cost management</span>
        </button>
      </div>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-icon">
            <i class="fas fa-folder" aria-hidden="true"></i>
          </span>
          <span class="pf-c-tree-view__node-text">Sources</span>
        </button>
      </div>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-icon">
            <i class="fas fa-folder" aria-hidden="true"></i>
          </span>
          <span class="pf-c-tree-view__node-text">This is a really really really long folder name that overflows from the width of the container.</span>
        </button>
      </div>
    </li>
  </ul>
</div>
```

### With badges

```html
<div class="pf-c-tree-view">
  <ul class="pf-c-tree-view__list" role="group">
    <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">Application launcher</span>
          <span class="pf-c-tree-view__node-count">
            <span class="pf-c-badge pf-m-read">2</span>
          </span>
        </button>
      </div>
      <ul class="pf-c-tree-view__list" role="group">
        <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
          <div class="pf-c-tree-view__content">
            <button class="pf-c-tree-view__node">
              <div class="pf-c-tree-view__node-toggle">
                <span class="pf-c-tree-view__node-toggle-icon">
                  <i class="fas fa-angle-right" aria-hidden="true"></i>
                </span>
              </div>
              <span class="pf-c-tree-view__node-text">Application 1</span>
              <span class="pf-c-tree-view__node-count">
                <span class="pf-c-badge pf-m-read">2</span>
              </span>
            </button>
          </div>
          <ul class="pf-c-tree-view__list" role="group">
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <span class="pf-c-tree-view__node-text">Settings</span>
                </button>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node pf-m-current">
                  <span class="pf-c-tree-view__node-text">Current</span>
                </button>
              </div>
            </li>
          </ul>
        </li>
        <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
          <div class="pf-c-tree-view__content">
            <button class="pf-c-tree-view__node">
              <div class="pf-c-tree-view__node-toggle">
                <span class="pf-c-tree-view__node-toggle-icon">
                  <i class="fas fa-angle-right" aria-hidden="true"></i>
                </span>
              </div>
              <span class="pf-c-tree-view__node-text">Application 2</span>
              <span class="pf-c-tree-view__node-count">
                <span class="pf-c-badge pf-m-read">2</span>
              </span>
            </button>
          </div>
          <ul class="pf-c-tree-view__list" role="group">
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <div class="pf-c-tree-view__node-toggle">
                    <span class="pf-c-tree-view__node-toggle-icon">
                      <i class="fas fa-angle-right" aria-hidden="true"></i>
                    </span>
                  </div>
                  <span class="pf-c-tree-view__node-text">Settings</span>
                  <span class="pf-c-tree-view__node-count">
                    <span class="pf-c-badge pf-m-read">2</span>
                  </span>
                </button>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <div class="pf-c-tree-view__node-toggle">
                    <span class="pf-c-tree-view__node-toggle-icon">
                      <i class="fas fa-angle-right" aria-hidden="true"></i>
                    </span>
                  </div>
                  <span class="pf-c-tree-view__node-text">Loader</span>
                  <span class="pf-c-tree-view__node-count">
                    <span class="pf-c-badge pf-m-read">2</span>
                  </span>
                </button>
              </div>
              <ul class="pf-c-tree-view__list" role="group">
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <div class="pf-c-tree-view__node-toggle">
                        <span class="pf-c-tree-view__node-toggle-icon">
                          <i class="fas fa-angle-right" aria-hidden="true"></i>
                        </span>
                      </div>
                      <span class="pf-c-tree-view__node-text">Loader app 1</span>
                      <span class="pf-c-tree-view__node-count">
                        <span class="pf-c-badge pf-m-read">2</span>
                      </span>
                    </button>
                  </div>
                </li>
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <span class="pf-c-tree-view__node-text">Loader app 2</span>
                    </button>
                  </div>
                </li>
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <span class="pf-c-tree-view__node-text">Loader app 3</span>
                    </button>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">Cost management</span>
          <span class="pf-c-tree-view__node-count">
            <span class="pf-c-badge pf-m-read">2</span>
          </span>
        </button>
      </div>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">Sources</span>
          <span class="pf-c-tree-view__node-count">
            <span class="pf-c-badge pf-m-read">2</span>
          </span>
        </button>
      </div>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">This is a really really really long folder name that overflows from the width of the container.</span>
          <span class="pf-c-tree-view__node-count">
            <span class="pf-c-badge pf-m-read">2</span>
          </span>
        </button>
      </div>
    </li>
  </ul>
</div>
```

### With action item

```html
<div class="pf-c-tree-view">
  <ul class="pf-c-tree-view__list" role="group">
    <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">Application launcher</span>
        </button>
        <div class="pf-c-tree-view__action">
          <button class="pf-c-button pf-m-plain" type="button" aria-label="Actions">
            <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <ul class="pf-c-tree-view__list" role="group">
        <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
          <div class="pf-c-tree-view__content">
            <button class="pf-c-tree-view__node">
              <div class="pf-c-tree-view__node-toggle">
                <span class="pf-c-tree-view__node-toggle-icon">
                  <i class="fas fa-angle-right" aria-hidden="true"></i>
                </span>
              </div>
              <span class="pf-c-tree-view__node-text">Application 1</span>
            </button>
            <div class="pf-c-tree-view__action">
              <button class="pf-c-button pf-m-plain" type="button" aria-label="Copy">
                <i class="fas fa-clipboard" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          <ul class="pf-c-tree-view__list" role="group">
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <span class="pf-c-tree-view__node-text">Settings</span>
                </button>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node pf-m-current">
                  <span class="pf-c-tree-view__node-text">Current</span>
                </button>
              </div>
            </li>
          </ul>
        </li>
        <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
          <div class="pf-c-tree-view__content">
            <button class="pf-c-tree-view__node">
              <div class="pf-c-tree-view__node-toggle">
                <span class="pf-c-tree-view__node-toggle-icon">
                  <i class="fas fa-angle-right" aria-hidden="true"></i>
                </span>
              </div>
              <span class="pf-c-tree-view__node-text">Application 2</span>
            </button>
            <div class="pf-c-tree-view__action">
              <button class="pf-c-button pf-m-plain" type="button" aria-label="Action">
                <i class="fas fa-bars" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          <ul class="pf-c-tree-view__list" role="group">
            <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <div class="pf-c-tree-view__node-toggle">
                    <span class="pf-c-tree-view__node-toggle-icon">
                      <i class="fas fa-angle-right" aria-hidden="true"></i>
                    </span>
                  </div>
                  <span class="pf-c-tree-view__node-text">Settings</span>
                </button>
              </div>
            </li>
            <li class="pf-c-tree-view__list-item pf-m-expanded" role="treeitem" aria-expanded="true" tabindex="0">
              <div class="pf-c-tree-view__content">
                <button class="pf-c-tree-view__node">
                  <div class="pf-c-tree-view__node-toggle">
                    <span class="pf-c-tree-view__node-toggle-icon">
                      <i class="fas fa-angle-right" aria-hidden="true"></i>
                    </span>
                  </div>
                  <span class="pf-c-tree-view__node-text">Loader</span>
                </button>
              </div>
              <ul class="pf-c-tree-view__list" role="group">
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <div class="pf-c-tree-view__node-toggle">
                        <span class="pf-c-tree-view__node-toggle-icon">
                          <i class="fas fa-angle-right" aria-hidden="true"></i>
                        </span>
                      </div>
                      <span class="pf-c-tree-view__node-text">Loader app 1</span>
                    </button>
                  </div>
                </li>
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <span class="pf-c-tree-view__node-text">Loader app 2</span>
                    </button>
                  </div>
                </li>
                <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="-1">
                  <div class="pf-c-tree-view__content">
                    <button class="pf-c-tree-view__node">
                      <span class="pf-c-tree-view__node-text">Loader app 3</span>
                    </button>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">Cost management</span>
        </button>
      </div>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">Sources</span>
        </button>
      </div>
    </li>
    <li class="pf-c-tree-view__list-item" role="treeitem" aria-expanded="false" tabindex="0">
      <div class="pf-c-tree-view__content">
        <button class="pf-c-tree-view__node">
          <div class="pf-c-tree-view__node-toggle">
            <span class="pf-c-tree-view__node-toggle-icon">
              <i class="fas fa-angle-right" aria-hidden="true"></i>
            </span>
          </div>
          <span class="pf-c-tree-view__node-text">This is a really really really long folder name that overflows from the width of the container.</span>
        </button>
        <div class="pf-c-tree-view__action">
          <div class="pf-c-dropdown">
            <button class="pf-c-dropdown__toggle pf-m-plain" id="dropdown-kebab-button" aria-expanded="false" type="button" aria-label="Actions">
              <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
            </button>
            <ul class="pf-c-dropdown__menu pf-m-align-right" aria-labelledby="dropdown-kebab-button" hidden>
              <li>
                <a class="pf-c-dropdown__menu-item" href="#">Link</a>
              </li>
              <li>
                <button class="pf-c-dropdown__menu-item" type="button">Action</button>
              </li>
              <li>
                <a class="pf-c-dropdown__menu-item pf-m-disabled" href="#" aria-disabled="true" tabindex="-1">Disabled link</a>
              </li>
              <li>
                <button class="pf-c-dropdown__menu-item" type="button" disabled>Disabled action</button>
              </li>
              <li class="pf-c-divider" role="separator"></li>
              <li>
                <a class="pf-c-dropdown__menu-item" href="#">Separated link</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </li>
  </ul>
</div>
```

## Documentation

### Overview

### Accessibility

| Attribute                          | Applied to                                 | Outcome                                                                                                                                                                                                                             |
| ---------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `role="tree"`                      | `.pf-c-tree-view__list`                    | Identifies the `ul` as a tree widget. **Place on the outermost `ul` only**                                                                                                                                                          |
| `role="group"`                     | `.pf-c-tree-view__list`                    | Identifies the `ul` element as a container of treeitem elements that form a branch of the tree. **Place on all `ul`s except the first `ul`**                                                                                        |
| `role="treeitem"`                  | `.pf-c-tree-view__list-item`               | Hides the implicit listitem role of the li element from assistive technologies.                                                                                                                                                     |
| `aria-expanded="false"`            | `.pf-c-tree-view__list-item`               | For an expandable item, indicates the parent node is closed, i.e., the descendant elements are not visible.                                                                                                                         |
| `aria-expanded="true"`             | `.pf-c-tree-view__list-item.pf-m-expanded` | Indicates the parent node is open, i.e., the descendant elements are visible.                                                                                                                                                       |
| `tabindex="-1"`                    | `.pf-c-tree-view__list-item`               | Makes the element with the treeitem role focusable without including it in the tab sequence of the page.                                                                                                                            |
| `tabindex="0"`                     | `.pf-c-tree-view__list-item`               | Includes the element with the treeitem role in the tab sequence. Only one treeitem in the tree has tabindex="0". When the user moves focus in the tree, the element included in the tab sequence changes to the element with focus. |
| `aria-label="[button label text]"` | `.pf-c-tree-view__action`                  | Provides an accessible name for the button when an icon is used instead of text. **Required when icon is used with no supporting text**                                                                                             |

### Usage

| Class                                 | Applied                 | Outcome                                         |
| ------------------------------------- | ----------------------- | ----------------------------------------------- |
| `.pf-c-tree-view`                     | `<div>`                 | Initiates the tree view container. **Required** |
| `.pf-c-tree-view__list`               | `<ul>`                  | Initiates a tree view list. **Required**        |
| `.pf-c-tree-view__list-item`          | `<li>`                  | Initiates a tree view list item. **Required**   |
| `.pf-c-tree-view__content`            | `<div>`                 | Initiates a tree view node. **Required**        |
| `.pf-c-tree-view__node`               | `<button>`, `<a>`       | Initiates a tree view node. **Required**        |
| `.pf-c-tree-view__node-count`         | `<span>`                | Initiates a tree view node count.               |
| `.pf-c-tree-view__node-toggle`        | `<div>`                 | Initiates a tree view toggle.                   |
| `.pf-c-tree-view__node-toggle-button` | `<button>`              | Initiates a tree view toggle button.            |
| `.pf-c-tree-view__node-toggle-icon`   | `<span>`                | Initiates a tree view toggle icon.              |
| `.pf-c-tree-view__node-text`          | `<span>`                | Initiates tree view text.                       |
| `.pf-c-tree-view__node-icon`          | `<span>`                | Initiates a tree view icon.                     |
| `.pf-c-tree-view__node-check`         | `<span>`                | Initiates a tree view check.                    |
| `.pf-c-tree-view__action`             | `<div>`                 | Initiates a tree view action wrapper.           |
| `.pf-c-tree-view__search`             | `<div>`                 | Initiates a tree view search wrapper.           |
| `.pf-m-current`                       | `.pf-c-tree-view__node` | Modifies the tree view node to be current.      |
