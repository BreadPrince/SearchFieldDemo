window.onload = function() {
	var searchField = document.querySelector('.search-field')
	var searchInput = document.querySelector('#search-input')
	var searchButton = document.querySelector('.search-button')
	var searchSelect = document.querySelector('.search-select')
	var dropDown = document.querySelector('.dropdown')

	var data = {}
	var chosen = {}
	
	var getDropDownData = function() {
		var xmlhttp = new XMLHttpRequest()
		var url = './data.json'

		if (xmlhttp==null) {
			alert('Your browser doesn\'t support')
			return
		}

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState==4&&xmlhttp.status==200) {
				data = xmlhttp.response.data
				getDropDown(data)
			}
		}

		xmlhttp.open('GET', url, true)
		xmlhttp.responseType = 'json'
		xmlhttp.send()
	}
	getDropDownData()

	searchField.setAttribute('tabIndex', '-1')
	searchField.addEventListener('focus', function(e) {
		searchInput.focus()
	})

	searchInput.addEventListener('focus', function(e) {
		var searchWrapper = document.querySelector('.search-wrapper')
		searchWrapper.style.width = '100%'
		searchWrapper.style.height = '100%'
	})
	document.querySelector('.search-wrapper').addEventListener('click', function(e) {
		if (e.target == this) {
			dropOutDD()
		}
	})
	searchInput.addEventListener('blur', searchInputBlur)
	var searchInputBlur = function(e) {
		var searchWrapper = document.querySelector('.search-wrapper')
		searchWrapper.style.width = '0'
		searchWrapper.style.height = '0'
		dropOutDD()
	}
	searchField.addEventListener('click', function(e) {
		getDropDown(data)
	})

	// 自适应input宽度
	var timer = 0;  // Http请求定时器
	searchInput.addEventListener('keydown', function(e) {
		if (e.key=='Backspace') {
			var sizer = document.querySelector('.calculate-input-width')
			sizer.textContent = e.target.value
			sizer.style.visibility = 'hidden'
			sizer.style.display = 'inline-block'
			e.target.style.width = parseInt(window.getComputedStyle(sizer).width)+14+'px'
			sizer.style.display = 'none'
			sizer.style.visibility = 'visible'

			// clear the timer when start typing
			clearTimeout(timer);

			if (searchInput.value=='') {
				var textWrapper = searchField.querySelector('.text-wrapper')
				var children = Array.prototype.slice.call(textWrapper.children)
				var len = children.length
				if (len>1) {
					clearChosen(children[len-2])
					getDropDown(data)
				}
			}
		}
	})
	searchInput.addEventListener('keypress', function(e) {
		var sizer = document.querySelector('.calculate-input-width')
		sizer.textContent = e.target.value
		sizer.style.visibility = 'hidden'
		sizer.style.display = 'inline-block'
		e.target.style.width = parseInt(window.getComputedStyle(sizer).width)+14+'px'
		sizer.style.display = 'none'
		sizer.style.visibility = 'visible'

		// clear the timer when start typing
		clearTimeout(timer);
		// send http request after 500ms when stop typing
		timer = setTimeout(function(){ getDropDown(data) }, 100)
	})
	searchInput.addEventListener('keyup', function(e) {
		var sizer = document.querySelector('.calculate-input-width')
		sizer.textContent = e.target.value
		sizer.style.visibility = 'hidden'
		sizer.style.display = 'inline-block'
		e.target.style.width = parseInt(window.getComputedStyle(sizer).width)+14+'px'
		sizer.style.display = 'none'
		sizer.style.visibility = 'visible'

		if (e.key=='Backspace') {
			// only for Backspace key
			timer = setTimeout(function(){ getDropDown(data) }, 100)
		}
	})

	dropDown.setAttribute('tabIndex', '-1')
	dropDown.addEventListener('focus', function(e) {
		e.stopPropagation()
	})
	dropDown.querySelector('div').addEventListener('click', function(e) {
		e.stopPropagation()
		if (e.target.tagName==='SPAN') {
			addTargetInput(e.target)

		}
	})

	searchSelect.setAttribute('tabIndex', '-1')
	searchSelect.addEventListener('focus', function(e) {
		var searchOptionWrapper = searchSelect.querySelector('div')
		e.stopPropagation()
		var H = parseInt(window.getComputedStyle(searchOptionWrapper).height)
		if (H < searchOptionWrapper.children.length * 36) {
			var t = setInterval(function() {
				if (H < searchOptionWrapper.children.length * 36) {
					H = H + 4
					searchOptionWrapper.style.height = H + 'px'
				} else {
					searchOptionWrapper.style.height = searchOptionWrapper.children.length * 36 + 'px'
					clearInterval(t)
				}
			}, 1)
		}
	})
	searchSelect.addEventListener('blur', function(e) {
		var searchOptionWrapper = searchSelect.querySelector('div')
		var H = parseInt(window.getComputedStyle(searchOptionWrapper).height)
		var t = setInterval(function() {
			if (H > 36) {
				H = H - 8
				searchOptionWrapper.style.height = H + 'px'
			} else {
				searchOptionWrapper.style.height = '36px'
				clearInterval(t)
			}
		}, 1)
	})
	// 代理所有子元素的点击事件
	searchSelect.querySelector('div').addEventListener('click', function(e) {
		e.stopPropagation()
		if (e.target.getAttribute('data-selected')=='false') {
			searchSelect.blur()
			var children = e.target.parentElement.children
			var childrenArr = Array.prototype.slice.call(children)
			var indexOfSelected = childrenArr.indexOf(e.target).toString()
			e.target.setAttribute('data-selected', 'true')

			var div = document.createElement('div')
			div.setAttribute('data-catalog', e.target.textContent)
			div.textContent = e.target.textContent
			e.target.parentElement.replaceChild(div, e.target.parentElement.querySelector('div'))

			e.target.classList.add('tobolder')

			childrenArr.forEach(function(el, index) {
				if (index!=indexOfSelected) {
					el.classList.remove('tobolder')
					el.setAttribute('data-selected', 'false')
				}
			})

			clearChosen()

			searchInput.value = ''
			searchInput.focus()
			getDropDown(data)
		}
	})

	document.querySelector('.text-wrapper').addEventListener('click', function(e) {
		e.stopPropagation()
		if (e.target.classList.contains('text-wrap-close')) {
			clearChosen(e.target.parentElement)
			getDropDown(data)
		}
	})

	var getDropDown = function(data) {
		var inputVal = searchInput.value.toLowerCase()
		var selectVal = searchSelect.querySelector('div').children[0].getAttribute('data-catalog')

		var result = []
		var realResult = []

		var dataLen = data.length
		for (var i=0; i<dataLen; i++ ) {
			var temp = data[i][selectVal]

			if (result.indexOf(temp)==-1 && temp) {
				result.push(temp)
			}

		}

		var inputValLen = inputVal.length
		var resultLen = result.length
		if (inputValLen==0) {
			for (var i=0; i<resultLen; i++) {
				realResult.push(result[i])
			}
		} else {
			for (var i=0; i<resultLen; i++) {
				var temp = result[i].toLowerCase()
				var tempLen = temp.length
				var pInputVal = 0

				for (var j=0; j<tempLen; j++) {

					if(temp.charAt(j)==inputVal.charAt(pInputVal)) {
						if (pInputVal==inputValLen-1) {
							realResult.push(result[i])
							break
						}
						pInputVal++
					}
				}
			}
			
		}

		addDropDownCell(realResult, dropDown.querySelector('div'))
		dropInDD()
	}

	var addDropDownCell = function(dataArray, parentElement) {
		var children = parentElement.children
		while(children.length) {
			children[0].remove()
		}

		var len = dataArray.length
		for (var i=0; i<len; i++) {
			var div = document.createElement('div')
			var span = document.createElement('span')
			div.classList.add('dropdowncell')
			span.textContent = dataArray[i]
			div.appendChild(span)

			if (chosen[span.textContent]!=null) {
				span.style.display = 'none'
			}

			parentElement.appendChild(div)
		}
	}


	var dropInDD = function() {
		var dropdown = document.querySelector('.dropdown')
		var ddHeight = parseInt(window.getComputedStyle(dropdown).height)
		var count = 0
		Array.prototype.forEach.call(dropdown.querySelector('div').children, function(el) {
			if (el.querySelector('span').style.display!='none') {
				count++
			}
		})
		if (ddHeight > count*36 && count<5) {
			var H = ddHeight
			var t = setInterval(function() {
				H = H/1 - 4
				if (H<=count*36) {
					dropdown.style.height = count*36 + 'px'
					clearInterval(t)
				} else {
					dropdown.style.height = H + 'px'
				}
				
			}, 1)
		} else if (ddHeight<count*36) {
			var H = ddHeight || 0
			var t = setInterval(function() {
				H = H/1 + 4
				if (H>=count*36 && H<=180) {
					clearInterval(t)
					dropdown.style.height = count*36 + 'px'
				} else if (H>180) {
					dropdown.style.height = '180px'
					clearInterval(t)
				} else {
					dropdown.style.height = H + 'px'
				}

			}, 1)
		} else {}
	}
	var dropOutDD = function() {
		var dropdown = document.querySelector('.dropdown')
		var ddHeight = window.getComputedStyle(dropdown).height
		var H = parseInt(ddHeight)
		var t = setInterval(function() {
			H = H/1 - 4
			if (H<=0) {
				clearInterval(t)
				dropdown.style.height = '0px'
			} else {
				dropdown.style.height = H + 'px'
			}
			
		}, 1)
	}

	var addTargetInput = function(target) {
		var span = document.createElement('span')
		var close = document.createElement('span')
		span.classList.add('text-wrap')
		close.classList.add('text-wrap-close')
		span.textContent = target.textContent

		var textWrapper = searchField.querySelector('.text-wrapper')

		chosen[span.textContent] = {
			target: target,
			targetInput: span
		}

		close.textContent = 'x'
		span.appendChild(close)
		textWrapper.appendChild(span)
		target.style.display = 'none'

		textWrapper.appendChild(searchInput)

		searchInput.value = ''
		getDropDown(data)
		searchInput.focus()
	}

	var clearChosen = function(el) {
		if (!el) {
			chosen = {}
			var children = searchField.querySelector('.text-wrapper').children;
			children = Array.prototype.slice.call(children)
			children.forEach(function(el) {
				if (el.tagName=='SPAN') {
					el.remove()
				}
			})
		} else {
			var key = el.textContent.slice(0, -1)
			chosen[key].targetInput.remove()
			chosen[key].target.style.display = 'block'
			delete chosen[key]
		}
	}
	
}