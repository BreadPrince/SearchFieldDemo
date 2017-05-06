window.onload = function() {
	searchField.init('.search-wrapper')
}

var searchField = (function() {
	var configMap = {
		main_html: String() +
			'<div>' +
				'<div class="search-field">' +
					'<div class="search-select" id="search-select">' +
						'<div>' +
							'<div data-catalog="catalog" class="catalog">- Catalog</div>' +
							// '<div data-selected="false">Person</div>'
						'</div>' +
					'</div>' +
					'<div class="text-wrapper">' +
						'<input type="text" name="search-input" class="search-input" id="search-input">' +
					'</div>' +
					'<button class="search-button">搜索</button>' +
					'<span class="calculate-input-width"></span>' +
					'<div class="dropdown">' +
						'<div></div>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div class="select-mask"></div>' +
			'<div class="dropdown-mask"></div>'
	}
	var stateMap = {
		containerId: undefined,
		data: {},
		currentSelectTarget: undefined,
		chosenData: {},
		timer: 0
	}

	var domMap = {}

	var setDOMMap, updateData, elementFactory, updateSelectOptions, updateDropDownCells, addChosenProperty, getChosenProperty, removeChosenProperty, slideDownSelectOptions, slideDownDropDownCells, slideUpDropDownCells, slideUpSelectOptions, searchInputFocused, searchFieldClicked, textWrapperClicked, dropDownClicked, searchSelectClicked, selectMaskClicked, dropDownMaskClicked, searchInputKeyPress, searchInputKeyUp, searchInputKeyDown, initModule

	// 更新 DOM 地图
	setDOMMap = function () {
		var container = document.querySelector(stateMap.containerId)

		domMap = {
			container:           container,
			searchField:         container.querySelector('.search-field'),
			selectMask:          container.querySelector('.select-mask'),
			dropDownMask:        container.querySelector('.dropdown-mask'),
			searchSelect:        container.querySelector('.search-select'),
			searchInput:         container.querySelector('.search-input'),
			searchButton:        container.querySelector('.search-button'),
			calculateInputWidth: container.querySelector('.calculate-input-width'),
			dropDown:            container.querySelector('.dropdown'),
			textWrapper:         container.querySelector('.text-wrapper')
		}
	}

	// 更新数据
	updateData = function() {
		var xmlhttp = new XMLHttpRequest()
		var url = './data.json'

		if (xmlhttp==null) {
			alert('Your browser doesn\'t support')
			return
		}

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState==4&&xmlhttp.status==200) {
				stateMap.data = xmlhttp.response.data
				updateSelectOptions()
			}
		}

		xmlhttp.open('GET', url, true)
		xmlhttp.responseType = 'json'
		xmlhttp.send()
	}

	// 创建 DOM 元素工厂方法
	elementFactory = function( tag, classes, textContent ) {
		var result = document.createElement(tag)
		if (classes) { result.classList.add(classes) }
		if (textContent) { result.textContent = textContent }

		return result
	}

	// 更新分类选项列表
	updateSelectOptions = function() {
		var selectOptionWrapper = domMap.searchSelect.querySelector('div'), keys

		var children = Array.prototype.slice.call(selectOptionWrapper.children)
		if (children.length>1) {
			children.forEach(function(el, index) {
				if (index>0) {
					el.remove()
				}
			})
		}

		if (stateMap.data.length > 0) {
			keys = Object.keys(stateMap.data[0])
		} else {
			keys = null
		}
		keys.forEach(function(el) {
			var div = elementFactory('div', null, el)
			div.setAttribute('data-selected', 'false')
			selectOptionWrapper.appendChild(div)
		})

		setDOMMap()
	}
	// 更新下拉列表
	updateDropDownCells = function( key ) {
		var dropDownWrapper = domMap.dropDown.querySelector('div')

		var children = Array.prototype.slice.call(dropDownWrapper.children)
		if (children.length>1) {
			children.forEach(function(el, index) {
				el.remove()
			})
		}

		if (stateMap.data.length > 0) {
			var noRepeat = []
			Array.prototype.forEach.call(stateMap.data, function(el, index) {
				if (key != '- Catalog' && noRepeat.indexOf(el[key])==-1) {
					var div = elementFactory('div', 'dropdowncell')
					var span = elementFactory('span', null, el[key])

					div.appendChild(span)
					dropDownWrapper.appendChild(div)
					noRepeat.push(el[key])
				}
			})
		}

		setDOMMap()
	}

	// chosenData 添加属性
	addChosenProperty = function( key, textWrap, target ) {
		if (stateMap.chosenData[key]==undefined) {
			stateMap.chosenData[key] = {
				textWrap: textWrap,
				target: target
			}
		}
	}
	// chosenData 获取属性
	getChosenProperty = function( key ) {
		if (stateMap.chosenData[key]) {
			return stateMap.chosenData[key]
		} else {
			return false
		}
	}
	// chosenData 删除属性
	removeChosenProperty = function( key ) {
		if (stateMap.chosenData[key]) {
			delete stateMap.chosenData[key]
		}
	}

	// 添加 text wrap
	addTextWrap = function( target ) {
		var textWrapper = domMap.searchField.querySelector('.text-wrapper')

		var content = target.textContent

		var span = elementFactory('span', 'text-wrap', content)
		var close = elementFactory('span', 'text-wrap-close','x')
		span.appendChild(close)

		addChosenProperty( content, span, target )
		textWrapper.appendChild(span)
		textWrapper.appendChild(domMap.searchInput)

		domMap.searchInput.focus()
	}
	// 删除 text wrap
	deleteTextWrap = function( target ) {
		var textWrapper = domMap.searchField.querySelector('.text-wrapper')

		var content = target.textContent.slice(0, -1)

		removeChosenProperty( content )
		target.remove()

		domMap.searchInput.focus()
	}

	// 下拉分类选项列表
	slideDownSelectOptions = function() {
		var selectOptionWrapper = domMap.searchSelect.querySelector('div')
		var optionHeight = parseInt( window.getComputedStyle(selectOptionWrapper.querySelector('div')).height )

		var count = Object.keys(stateMap.data[0]).length ? Object.keys(stateMap.data[0]).length : 0
		var height = ( count+1 ) * optionHeight

		var currentHeight = parseInt( window.getComputedStyle(selectOptionWrapper).height )

		if (count>2) {
			domMap.selectMask.style.width = '100%'
			domMap.selectMask.style.height = '100%'

			setDOMMap()
		}

		var t = setInterval(function() {
			if (currentHeight<height) {
				currentHeight+=4
			} else {
				clearInterval(t)
				currentHeight = height
			}
			selectOptionWrapper.style.height = currentHeight + 'px'
		}, 1);
	}
	// 收起分类选项列表
	slideUpSelectOptions = function() {
		var selectOptionWrapper = domMap.searchSelect.querySelector('div')
		var optionHeight = parseInt( window.getComputedStyle(selectOptionWrapper.querySelector('div')).height )

		var currentHeight = parseInt( window.getComputedStyle(selectOptionWrapper).height )

		domMap.selectMask.style.width = '0'
		domMap.selectMask.style.height = '0'

		setDOMMap()

		var t = setInterval(function() {
			if (currentHeight>optionHeight) {
				currentHeight-=4
			} else {
				clearInterval(t)
				currentHeight = optionHeight
			}
			selectOptionWrapper.style.height = currentHeight + 'px'
		}, 1)
	}

	// 下拉下拉列表
	slideDownDropDownCells = function( data ) {
		updateDropDownCells( domMap.searchSelect.querySelector('.catalog').textContent )

		var dropDownWrapper = domMap.dropDown.querySelector('div')
		var cellHeight = 36

		var children = Array.prototype.slice.call(dropDownWrapper.children)
		var count = children.length
		data = data || ''

		if (count>0 && data) {
			for (var i=0; i<children.length; i++) {
				var pData = 0
				var pText = 0
				var text = children[i].textContent
				text = text.toLowerCase()
				data = data.toLowerCase()

				while (pText<text.length) {
					console.log(data.charAt(pData), text.charAt(pText))
					if (data.charAt(pData)==text.charAt(pText)) {
						if (pText<=text.length-1 && pData==data.length-1) {
							break
						} else if (pText==text.length-1 && pData<data.length-1) {
							children[i].style.display = 'none'
							count--
							break
						} else {
							pText++
							pData++
						}
					} else {
						if (pText<text.length-1) {
							pText++
						} else {
							children[i].style.display = 'none'
							count--
							break
						}
					}
				}
			}
		}

		Object.keys(stateMap.chosenData).forEach(function(el) {
			for (var i=0; i<children.length; i++) {
				if (children[i].textContent==el && children[i].style.display!='none') {
					children[i].style.display = 'none'
					count--
				}
			}
		})

		var height = count<5 ? count * cellHeight : 5 * cellHeight

		var currentHeight = parseInt( window.getComputedStyle(domMap.dropDown).height )

		if (count>0) {
			domMap.dropDownMask.style.width = '100%'
			domMap.dropDownMask.style.height = '100%'

			setDOMMap()
		}

		var t = setInterval(function() {
			if (currentHeight<height-4) {
				currentHeight+=4
			} else if (currentHeight>height+4) {
				currentHeight-=4
			} else {
				clearInterval(t)
				currentHeight = height
			}
			domMap.dropDown.style.height = currentHeight + 'px'
		}, 1)
	}
	// 收起下拉列表
	slideUpDropDownCells = function() {
		var dropDownWrapper = domMap.dropDown.querySelector('div')
		var currentHeight = parseInt( window.getComputedStyle(domMap.dropDown).height )

		domMap.dropDownMask.style.width = '0'
		domMap.dropDownMask.style.height = '0'

		setDOMMap()

		var t = setInterval(function() {
			if (currentHeight>0) {
				currentHeight-=4
			} else {
				clearInterval(t)
				currentHeight = 0
			}
			domMap.dropDown.style.height = currentHeight + 'px'
		}, 1)
	}

	/* ------------------------------------------------------------------------------- */
	/* ------------------------------- 监听器部分 begin ------------------------------- */
	/* ------------------------------------------------------------------------------- */
	searchInputFocused = function ( event ) {
		domMap.selectMask.click()
		slideDownDropDownCells()
	}

	searchFieldClicked = function( event ) {
		event.stopPropagation()
		if (event.currentTarget.classList.contains('search-field')) {
			domMap.searchInput.focus()
		}
	}
	searchSelectClicked = function ( event ) {
		event.stopPropagation()

		if (event.target.hasAttribute('data-catalog')) {
			slideUpDropDownCells()
			slideDownSelectOptions()
		}

		if (event.target.getAttribute('data-selected')=='false') {

			// 清空输入框
			domMap.searchInput.value = ''
			var children = Array.prototype.slice.call(domMap.textWrapper.children)
			children.forEach(function(el) {
				if (el.tagName!='INPUT') {
					var content = el.textContent.slice(0, -1)
					removeChosenProperty(content)

					el.remove()
				}
			})

			if (stateMap.currentSelectTarget!=undefined) {
				stateMap.currentSelectTarget.setAttribute('data-selected', 'false')
				stateMap.currentSelectTarget.classList.remove('tobolder')
			}

			stateMap.currentSelectTarget = event.target
			stateMap.currentSelectTarget.setAttribute('data-selected', 'true')
			stateMap.currentSelectTarget.classList.add('tobolder')

			domMap.searchSelect.querySelector('.catalog').textContent = stateMap.currentSelectTarget.textContent

			setDOMMap()
			
			domMap.searchInput.focus()
		}
	}
	dropDownClicked = function ( event ) {
		event.stopPropagation()

		if (event.target.parentElement.classList.contains('dropdowncell')) {
			addTextWrap(event.target)
		}
	}
	textWrapperClicked = function ( event ) {
		event.stopPropagation()

		if (event.target.classList.contains('text-wrap-close')) {
			deleteTextWrap(event.target.parentElement)
		}
	}

	selectMaskClicked = function( event ) {
		slideUpSelectOptions()
	}
	dropDownMaskClicked = function( evenet ) {
		slideUpDropDownCells()
	}

	searchInputKeyPress = function( event ) {
		var sizer = document.querySelector('.calculate-input-width')
		sizer.textContent = event.target.value
		sizer.style.visibility = 'hidden'
		sizer.style.display = 'inline-block'
		event.target.style.width = parseInt(window.getComputedStyle(sizer).width)+14+'px'
		sizer.style.display = 'none'
		sizer.style.visibility = 'visible'

		// clear the timer when start typing
		clearTimeout(stateMap.timer);
		// send http request after 500ms when stop typing
		stateMap.timer = setTimeout(function(){ slideDownDropDownCells(event.target.value) }, 100)
	}
	searchInputKeyUp = function( event ) {
		var sizer = document.querySelector('.calculate-input-width')
		sizer.textContent = event.target.value
		sizer.style.visibility = 'hidden'
		sizer.style.display = 'inline-block'
		event.target.style.width = parseInt(window.getComputedStyle(sizer).width)+14+'px'
		sizer.style.display = 'none'
		sizer.style.visibility = 'visible'

		if (event.key=='Backspace') {
			// only for Backspace key
			stateMap.timer = setTimeout(function(){ slideDownDropDownCells(event.target.value) }, 100)
		}
	}
	searchInputKeyDown = function( event ) {
		if (event.key=='Backspace') {
			var sizer = document.querySelector('.calculate-input-width')
			sizer.textContent = event.target.value
			sizer.style.visibility = 'hidden'
			sizer.style.display = 'inline-block'
			event.target.style.width = parseInt(window.getComputedStyle(sizer).width)+14+'px'
			sizer.style.display = 'none'
			sizer.style.visibility = 'visible'

			// clear the timer when start typing
			clearTimeout(stateMap.timer);

			if (event.target.value=='') {
				var children = Array.prototype.slice.call(domMap.textWrapper.children)
				var len = children.length
				if (len>1) {
					removeChosenProperty(children[len-2].textContent.slice(0, -1))
					console.log(children[len-2])
					children[len-2].remove()
					slideDownDropDownCells(event.target.value)
				}
			}
		}
	}
	/* ------------------------------------------------------------------------------- */
	/* ------------------------------- 监听器部分 end ------------------------------- */
	/* ------------------------------------------------------------------------------- */

	// 初始化搜索框
	initModule = function( containerId ) {
		stateMap.containerId = containerId
		document.querySelector(containerId).innerHTML = configMap.main_html
		setDOMMap()

		updateData()

		domMap.searchInput.addEventListener('focus', searchInputFocused, false)
		domMap.searchInput.addEventListener('keypress', searchInputKeyPress, false)
		domMap.searchInput.addEventListener('keyup', searchInputKeyUp, false)
		domMap.searchInput.addEventListener('keydown', searchInputKeyDown, false)
		domMap.searchField.addEventListener('click', searchFieldClicked, false)
		domMap.searchSelect.addEventListener('click', searchSelectClicked, false)
		domMap.dropDown.addEventListener('click', dropDownClicked, false)
		domMap.selectMask.addEventListener('click', selectMaskClicked, false)
		domMap.dropDownMask.addEventListener('click', dropDownMaskClicked, false)
		domMap.textWrapper.addEventListener('click', textWrapperClicked, false)
	}

	return {
		init: initModule
	}
})();