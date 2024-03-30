import json

__tick_callbacks__ = []
__global_listeners__ = {}
__element_listeners__ = {}

def __listen_global__(descriptor, callback):
  kind = descriptor['kind']
  
  if not kind in __global_listeners__:
    __global_listeners__[kind] = []
  __global_listeners__[kind].append(callback)

  __listen__(descriptor)
  
def __listen_element__(descriptor, callback):
  id = str(descriptor['id'])
  kind = descriptor['kind']
  if not id in __element_listeners__:
    __element_listeners__[id] = {}
  if not kind in __element_listeners__[id]:
    __element_listeners__[id][kind] = []
  __element_listeners__[id][kind].append(callback)

  __listen__(descriptor)

def __trigger__(descriptor):
  context = descriptor['context']
  id = str(descriptor['id'])
  kind = descriptor['kind']
  
  if context == 'global' and kind in __global_listeners__:
    for callback in __global_listeners__[kind]:
      callback()
  elif id in __element_listeners__  and kind in __element_listeners__[id]:
    for callback in __element_listeners__[id][kind]:
      callback()

def __add_tick__(callback):
  __tick_callbacks__.append(callback)


mouseX = 0
mouseY = 0
pMouseX = 0
pMouseY = 0
mouseXSpeed = 0
mouseYSpeed = 0
minX = 0
minY = 0
maxX = 0
maxY = 0
width = 0
height = 0
mousedown = 0
keysDown = []

def __tick__(tick):
  
  global mouseX
  global mouseY
  global pMouseX
  global pMouseY
  global mouseXSpeed
  global mouseYSpeed
  global minX
  global minY
  global maxX
  global maxY
  global width
  global height
  global mousedown
  global keysDown
  
  globals = tick['globals']

  mouseX = globals['mouseX']
  mouseY = globals['mouseY']
  pMouseX = globals['pMouseX']
  pMouseY = globals['pMouseX']
  mouseXSpeed = globals['mouseXSpeed']
  mouseYSpeed = globals['mouseYSpeed']
  minX = globals['minX']
  minY = globals['minY']
  maxX = globals['maxX']
  maxY = globals['maxY']
  width = globals['width']
  height = globals['height']
  mousedown = globals['mousedown']
  keysDown = globals['keysDown']
  
  for callback in __tick_callbacks__:
    callback(tick)

__update__backdrop__ = __register__('backdrop').update

def set_backdrop_url(url):
  __update__backdrop__({
    'kind': 'backdrop',
    'url': url,
    'style': 'cover'
  })
  
class every(object):
  last = 0
  
  def __init__(self, duration, unit, callback):
    self.duration = duration
    self.unit = unit
    self.callback = callback
    
    __add_tick__(self.doTick)
  
  def doTick(self, tick):
    self.last = self.last + tick['deltaTime']
    
    scale = 1
    
    if self.unit == 'seconds':
      scale = 1000
    elif self.unit == 'milliseconds':
      scale = 1
    
    if self.last / scale >= self.duration:
      self.callback()
      self.last = 0
  
class _GameObject(object):
  def __init__(self, options, kind=None):
    super().__init__()
    registration = __register__(kind)
    
    self._kind = kind
    self._update = registration.update
    self._dispose = registration.dispose
    self._id = registration.id
    self._values = {}
    
    self._apply_options(options)
    self._update(self._descriptor)
    
  def _apply_options(self, options):
    for key in options.keys():
      self._values[key] = options[key]

  @property
  def _descriptor(self):
    descriptor = {
      'kind': self._kind
    }
    
    return {
      **self._values,
      'kind': self._kind
    }
  
  
class _InteractiveGameObject(_GameObject):
  @property
  def x(self):
    return self._values['x']
  
  @x.setter
  def x(self, value):
    self._values['x'] = value
    self._update(self._descriptor)
  
  @property
  def y(self):
    return self._values['y']
  
  @y.setter
  def y(self, value):
    self._values['y'] = value
    self._update(self._descriptor)
  
  @property
  def width(self):
    return self._values['x']
  
  @width.setter
  def width(self, value):
    self._values['width'] = value
    self._update(self._descriptor)
  
  @property
  def height(self):
    return self._values['height']
  
  @height.setter
  def height(self, value):
    self._values['height'] = value
    self._update(self._descriptor)
    
  @property
  def angle(self):
    return self._values['angle']
  
  @angle.setter
  def angle(self, value):
    self._values['angle'] = value
    self._update(self._descriptor)

  def on_click(self, callback):
    __listen_element__({
      'kind': 'click',
      'context': 'local',
      'id': self._id
    }, callback)

class Image(_InteractiveGameObject):
  def __init__(self, options):
    super().__init__(options, kind='image')
    
  @property
  def url(self):
    return self._values['url']
  
  @url.setter
  def url(self, value):
    self._values['url'] = value