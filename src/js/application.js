/**
 * ChartGen Application
 */


(function() {

	// TODO: oop
	
	// https://docs.google.com/spreadsheet/pub?key=0At3Jz5g4s0W6dG0wWk1aTWd5VXlQT1ZyWVNNWjlVLWc&single=true&gid=0&output=csv
	
	// constants
	
	var welcomeSourceUrl = 'welcome.csv'; 
	
	var serviceUrl = "service/csv.php";
	//var serviceUrl = "http://dev.benignware.com/chartgen/service/csv.php";
	
	var patterns = {
		date: ['dd.mm.yy'], 
		number: ['#.##'], 
		string: ['none']
	}
	var columnNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var showRows = 3;
	
	
	
	// variables
	var providers = [];
	var dataArray = null;
	var dataTable = null;
	var chartElement = null;
	
	window.registerProvider = function(id, obj) {
		providers[id] = obj;
	}
	
	window.getProvider = function(id) {
		return providers[id];
	}
	
	$(document).ready(function() {
		init();
	});
	
	function init() {
		updateProviderSelect();
		loadDataSource();
		var form = document.getElementById('chart-form');
		form.onchange = function() {
			renderChart();
		}
	}
	
	function updateProviderSelect() {
		var providerSelect = document.getElementById('provider-select');
		providerSelect.innerHTML = "";
		for (var x in providers) {
			providerSelect.options[providerSelect.options.length] = new Option(x, x);
		}
	}
	
	window.loadDataSource = function() {
		
		var sourceUrlInput = document.getElementById('data-source-url-input');
		
		if (!sourceUrlInput.value) {
			sourceUrlInput.value = welcomeSourceUrl;
		}
		var sourceUrl = sourceUrlInput.value;
		console.info("loading data source '" + sourceUrl + "'...'");
		
		sourceUrlInput.parentNode.className = 'loading';
		
		// load source
		var url = serviceUrl + "?url=" + encodeURIComponent(sourceUrl) + "";
		
		$.ajax({ url: url,
	    	dataType: "jsonp",
	        success: function(json) {
	        	dataSourceComplete(json);
	        },
	        error: function() {
	            console.error('error loading data');
	        }
	    });
	}
	
	function dataSourceComplete(json) {
		var sourceUrlInput = document.getElementById('data-source-url-input');
		sourceUrlInput.parentNode.className = '';
		dataArray = json;
		var form = document.getElementById('chart-form');
		var dataSourceFormatOptions = document.getElementById('data-source-format-options');
		renderDataSourceFormatOptions(dataSourceFormatOptions, dataArray);
		renderChart();
	}
	
	window.renderChart = function() {
		
		var preview = document.getElementById('chart-preview');
		preview.className = '';
		preview.innerHTML = "";
		
		if (!dataArray) {
			preview.innerHTML = "No Data.";
			return;
		}
		
		try {
			// get data-table
			var form = document.getElementById('chart-form');
			var options = getFormObject(form);

			var dataTable = getDataTableFromArray(dataArray, options.dataSourceFormat);
			
			if (!dataTable) {
				throw "Data Table is not defined.";
			}
			
			options.dataTable = dataTable.toJSON();
			
			// render chart
			var providerObj = providers[options.provider];
			if (!providerObj) {
				throw "Provider '" + options.provider + "' is not defined.";
			}
			delete options.provider;
			// render
			
			chartElement = preview.ownerDocument.createElement('div');
			preview.appendChild(chartElement);
			
			providerObj.renderChart(chartElement, options);
			
			var embed = document.getElementById('chart-embed-area');
			if (embed) {
				embed.innerHTML = chartElement.innerHTML;
			}
			
			
		} catch (e) {
			preview.className = 'error';
			preview.innerHTML = e;
			console.error(e);
		}
	}

	function renderDataSourceFormatOptions(form, dataArray) {
		
		var firstRowCheckbox = document.getElementById('data-source-format-first-row-checkbox');

		firstRowAsColumnLabels = firstRowCheckbox.checked;
		
		var rows = dataArray.slice();
		
		
		// number of rows / columns
		var numRows = rows.length;
		var numCols = rows[0].length;
		
		// column labels
		var columnLabels = firstRowAsColumnLabels ? rows[0] : [];
		
		// document shortcut
		var doc = form.ownerDocument;
		
		// clear element
		form.innerHTML = "";
		
		// create table
		var table = doc.createElement('table');
		form.appendChild(table);
		var tbody = doc.createElement('tbody');
		table.appendChild(tbody);
		
		var tr, th, td, label;
	
		// column ids
		tr = doc.createElement('tr');
		tbody.appendChild(tr);
		
		th = doc.createElement('th');
		th.innerHTML = "";
		tr.appendChild(th);
		
		for (var c = 0; c < numCols; c++) {
			th = doc.createElement('th');
			th.innerHTML = firstRowAsColumnLabels ? columnLabels[c] : columnNames.charAt(c);
			tr.appendChild(th);
		}
	
		var typeSelects = [];
		var patternSelects = [];
		
		function updatePatternSelect(select, type) {
			select.innerHTML = "";
			var typePatterns = patterns[type];
			for (var i = 0; i < typePatterns.length; i++) {
				var pattern = typePatterns[i];
				select.options[select.options.length] = new Option(pattern, pattern);
			}
		}
		
		// column types
		tr = doc.createElement('tr');
		tbody.appendChild(tr);
		
		th = doc.createElement('th');
		th.innerHTML = "Type";
		tr.appendChild(th);
		
		for (var c = 0; c < numCols; c++) {
			td = doc.createElement('td');
			tr.appendChild(td);
			var typeSelect = doc.createElement('select');
			typeSelect.name = "dataSourceFormat[columns][" + c + "][type]";
			(function() {
				var columnIndex = c;
				typeSelect.onchange = function(event) {
					updatePatternSelect(patternSelects[columnIndex], typeSelects[columnIndex].value);
				}
			})();
			td.appendChild(typeSelect);
			var types = ['number', 'date', 'string'];
			for (var i = 0; i < types.length; i++) {
				typeSelect.options[typeSelect.options.length] = new Option(types[i], types[i]);
			}
			typeSelects[c] = typeSelect;
		}
		
		// column patterns
		tr = doc.createElement('tr');
		tbody.appendChild(tr);
		
		th = doc.createElement('th');
		th.innerHTML = "Pattern";
		tr.appendChild(th);
		for (var c = 0; c < numCols; c++) {
			td = doc.createElement('td');
			tr.appendChild(td);
			var patternSelect = doc.createElement('select');
			
			patternSelects[c] = patternSelect;
			
			td.appendChild(patternSelect);
			
			patternSelect.name = "dataSourceFormat[columns][" + c + "][pattern]";
			updatePatternSelect(patternSelect, typeSelects[c].value);
			
		}

		var firstTableRow = null;
		// data rows
		for (var r = 0; r < rows.length; r++) {
	
			tr = doc.createElement('tr');
			tbody.appendChild(tr);
			
			th = doc.createElement('th');
			th.innerHTML = firstRowAsColumnLabels ? r : r + 1;
			tr.appendChild(th);
			
			for (var c = 0; c < numCols; c++) {
				td = doc.createElement('td');
				td.innerHTML = rows[r][c];;
				tr.appendChild(td);
			}
			
			if (r == 0) {
				firstTableRow = tr;
				firstTableRow.style.display = firstRowAsColumnLabels ? 'none' : '';
			}
	
			// limit rows
			if (rows.length > showRows + 1 && r == showRows - 1) {
				r = rows.length - 2;
			}
			
			if (r > 100) break;
		}

		
		firstRowCheckbox.onclick = function() {
			
			firstTableRow.style.display = this.checked ? 'none' : '';
			var columnTableHeaders = tbody.firstChild.childNodes;
			firstRowAsColumnLabels = this.checked;
			for (var c = 0; c < numCols; c++) {
				var th = columnTableHeaders[c + 1];
				th.innerHTML = firstRowAsColumnLabels ? columnLabels[c] : columnNames.charAt(c);
			}
			
			var tr = firstTableRow;
			var r = 0;
			while (tr) {
				tr.style.display = r == 0 && firstRowAsColumnLabels || !firstRowAsColumnLabels && r == showRows - 1 ? 'none' : '';
				var th = tr.firstChild;
				var label = firstRowAsColumnLabels ? r : r + 1;
				if (!tr.nextSibling) {
					label = firstRowAsColumnLabels ? numRows - 1 : numRows;
				}
				th.innerHTML = label;
				tr = tr.nextSibling;
				r++;
			}
			
		}

	}
	
	window.showEmbedCode = function() {
		var embedCode = chartElement ? chartElement.innerHTML : "";
		window.prompt ("Copy to clipboard: Ctrl+C and press Enter", embedCode);
	}


})();