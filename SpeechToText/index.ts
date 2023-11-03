import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class SpeechToText
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  // PCF framework to notify of changes
  private _notifyOutputChanged: () => void;
  private _changeEvt: Event = new Event("change");
  private _flag: boolean = true;
  private _value: string = "";
  // Define Input Elements
  private _inputText: HTMLTextAreaElement;
  private _langSelect: HTMLSelectElement;
  private _hidText: HTMLInputElement;

  /*** Empty constructor.***/
  constructor() {}

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ) {
    var _speakNowButton: HTMLButtonElement;
    var _container: HTMLDivElement;
    var _lbl: HTMLLabelElement;
    this._notifyOutputChanged = notifyOutputChanged;

    //added to manage onchange event from js and ts
    this._hidText = document.createElement("input");
    this._hidText.setAttribute("id", "id_hid");
    this._hidText.setAttribute("type", "hidden");
    this._hidText.addEventListener("change", this.RefreshData.bind(this));
    container.append(this._hidText);

    // Add control initialization code
    _container = document.createElement("div");

    // Add a style block to the container
    const styleBlock = document.createElement("style");
    styleBlock.innerHTML = `
.div-left {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

#id_labellang {
  margin-right: 5px;
}

#id_lang {
  margin-left: 5px;
}

.btn-row {
  display: flex;
  align-items: center;
}

.mic-label {
  margin-left: 10px;
}


.dropdown-label {
  display: inline-block;
  margin-bottom: 10px;
  padding: 10px;
  margin-top: 5px;
  text-align: left;
}

/* Align labels to the left */
label {
  width: 250px;
  text-align: left;
  margin-bottom: 10px;
  padding: 10px;
  margin-top: 5px;
}

.none {
	display: None;
	width: 0%;
}


.dropdown {
  display: block;
  margin-top: 5px;
  margin-bottom: 10px;
  padding: 10px;
  width: 300px;
}

/* Microphone label */
.mic-label {
  display: block;
   margin-top: 20px;
  margin-bottom: 10px;
}

/* Input text */
.input-text {
  width: 95%;
  height: 150px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  font-size: 13px;
  margin-top: 20px;
  resize: none;
 
}

.btn-start {
	display: inline-block;
  	width: 36px;
 	height: 36px;
	background: 
	url(
		"data:image/png;base64,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"
	) no-repeat ;
	background-size: contain;
  border: none;
  margin-left: 2%;
  cursor: pointer;
}
.btn-stop {
	display: inline-block;
  	width: 36px;
 	height: 36px;
	background: 
	url(
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAABPCAYAAACqNJiGAAAABHNCSVQICAgIfAhkiAAAB0dJREFUeF7tnH9sU1UUx89rt+IAEXFs64MQMcgPA+1DDBFEQoKKaJzwh0aNiRpjxD8M8JeYEBQNARITgcQI/qH4j/xjEGcUMEGjRPQPkBVQgZCoC2s3GAjIHLSsx+/tD7Zua9+9r+917et7SWlZzz333E/P/X3v0Wg4n+DMGUT+6cRakDQOwhS8Mp8ZnzWtiZg7SKMYZGJEjFfms4bPCfqNuiKnh6sIWokz9lNjaBH5fE8ARDPgTC4+fz4F4C3Q10LRyM/Q11u8TjkNzsMbN2UMBUY9Cu8BLFqKgo6TM82KFF8kpm/gpS0Uv7qfLp65YkWLbBrn4I01xtJIfhOwXocxdbIG2SjXQ0neRj3JzXT5+D826r2pyn54EyfWUfKOlYD2BnIZ64TRajpZgNtMvgvb6OzZHrW0haXthFdDwfDLaMfWIUvdTiNt0hVF57OeYpGPoe+GHTrtgKdRU/gp8tG78LapdhjlrA4+TUltLXW0fo58uJi8ioMnqmhv/S50BE8WY8SwpGXeTf4LzxdTla3Dq58RpEDga3jb7GEpvB2ZMh+hhK+Zuo5GraizBm+8YVAtAVxZtm2KHLiduPdhip34QzEhKpzqo4eaiX2iqo5UTVrG8pfR/D2NQfa3KjaqwQuGxLhtA3pUtXQqFg2XLGNmwrQSHckHsibIQ9DDj0D5XoDzySqvQLkEcbKZYsf2ydguB2+8cTfV0GFU1TEySitc5jLFea7MgoM5vPppt1LglsOVMYaz62fDYsO17rlmc2MzeBpmDaKqLrHLrIrRI5qoWOvjhQbSheE1hTeRLzVHrc4nyZupI7ImX+Hzw2uYNY9q/Ieqk1pOqRdQtPWnoTjkh6cbIsH8qofH9AOq7yJ5eLqxDMJfVD24LABOLh1q+DKU5/nQSUTQScz04GUIMB/HUpaB/yX7MxkMr8l4EctLn3jgBhBI0kuYfewsAG/KCAqOPonB8J0evAEEmP+kWDd2+85cz36T63l6GN2yttEDl4cA02p0HlsGwxMzidq6s1UyBbPmH8yddL17anbm0ed5wRC2B317rWktnIrbjzqh1lSnNsGBddp+PW8/eOHt6GFfNbXIgoC74PEO9LwrBIY+eLohlqLFkQfbH1fBI4pixjGhD15j6H7y+8RRBUcel8HDgY7kPOo89kva8xxeAHAdvMyCQRqeHj6JGjzNEbeDUtfBI4qg6hoa6bOm45iX8s6RCmjXwWNmSsQnAJ7ziwCug5f2nOVYKTZWoc99X8WTVGVdCY/5NXHOxPHVYlfCI1ovqu1OeNILqt6kIu9SeJ+KDZ59Tm/wuBIe837hea3worCKJ6nKuhIehivC83DaXGtUBaIi70p4WGGB54WvYYA8QgWGqqwr4RFf9zxP1ROy8mnP89o8i/xSbZ7X21qhx/SlN86zAk6kYd4h4L2Nj29Z1SGTzp0dhphhBMMrMFT5UAaCVRlXwkvNbb1VFas+gVUVcSWgNtDu5Dlj13meWM+7kdAzK8nODldcB+/mSrJwWoeXpVwHL2cPw9s9U2v3cnbPRFLdaBf/qmmRk3aZ58Ww+ZPi5J0YkPv9+6QwOB58YsA7qyKHccizKjSnlvQbV+GMATkt8lKuqbZMVyjmryc6ksittql2zzufV9glEDMhGtmUlRlwrFacDB31t9Mry/I+W0aSTH9R7CoOCOQ7GSpsLcFct4yQyJtifiY5pUuchj9jT8AYedvKWpL5BHpYsUlmcho+1faFngHDXWVdoNIatxxjuz0Ds8x/AygYPgjvW1BaG8syt0MA98BQlhW4PhWahuvwv7rsOrzar8P0H2nJeyl6DPGqBj+Fbz3qoWdRfT9Ty9FN0snnAC5v82V23xa9r7EF3ofwRlX2MG3FnYtVhUptDo9wQT5oHADAhVWDj+lHgFuM8hYMmyQDD+t9s8ej7p9AB9LgeoDM59DWz6SOo+fNyioHLzV4Dj2ISy4H8KnWTGkFfy+iWyzG9dCDMmWQh5cC6PwpUhmjHZPBjhgGw9tl9avBE1obQ4sRtnK3q+6oidUS5mWIJ/C9LDghpw5PpNLFGFDbgzYQE+VKfxAGJI6QnBYCt1qDJ3il4q3U7canhyoXH39H8WvLqOvUv1bKYB1eOjc/dt42VGj4kPcw7RJhPyxHty0WXhphgzEfGLeiEbjPyi9Y0jSMsE69GPSfay067Ik98NKlx9ENrMZwKsrZ5JICkclMLGYSrcXgV0w3iwp3mc3OTngZnfcEqCnwCiJuryuLQTXTedjyDkUTHxH9HpfhLCvjALxM1ulr92vgj6vxl+GJk8y0hRI9G612CGYQnYOXzTkVoXv0Evz6IkL3YyWI0L0XlRIRurv3mUUhM4Nj9r3z8HItEL3zQlTn5kxs+LvMDDT/HqF7ib7CtKqFYsdFCCfLvad5XrkSpYaXm/vtc26jQHwSaf5J2B7Au4Z38eL0u8ZNSNCJVxs6Iry4DX9Pv3NvG8Vr2uhS6yXVQtsl/z/4L1/bTkPHLQAAAABJRU5ErkJggg=="
	) no-repeat ;
	background-size: contain;
  border: none;
  margin-left: 2%;
  cursor: pointer;
}

.btn-reset {
	display: inline-block;
  	width: 36px;
 	height: 36px;
	background: 
	url(
		"data:image/png;base64,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"
	) no-repeat ;
	background-size: contain;
  border: none;
  margin-left: 2%;
  cursor: pointer;
}

.btn-start:disabled {
  opacity: 0.5; /* Reduce opacity of disabled button */
  cursor: not-allowed; /* Change cursor to indicate disabled state */
}

.btn-stop:disabled {
  opacity: 0.5; /* Reduce opacity of disabled button */
  cursor: not-allowed; /* Change cursor to indicate disabled state */
}

.btn-reset:disabled {
  opacity: 0.5; /* Reduce opacity of disabled button */
  cursor: not-allowed; /* Change cursor to indicate disabled state */
}
		`;
    _container.appendChild(styleBlock);

    // Layout Elements
    var divStartLeft = document.createElement("div");
    var divStartRight = document.createElement("div");
    var buttondiv = document.createElement("div");

    divStartLeft.setAttribute("class", "div-left");
    divStartRight.setAttribute("class", "div-right");
    buttondiv.setAttribute("class", "btn-row");

    _lbl = document.createElement("label");
    _lbl.setAttribute("id", "id_labellang");
    _lbl.innerText = "Please Select your language";
    divStartLeft.append(_lbl);

    this._langSelect = document.createElement("select");
    this._langSelect.setAttribute("id", "id_lang");
    this._langSelect.setAttribute("class", "dropdown");
    this._langSelect.setAttribute("title", "Select Language");
    this._langSelect.add(new Option("English", "en-US"));
    divStartLeft.append(this._langSelect);

    _lbl = document.createElement("label");
    _lbl.setAttribute("id", "id_labelMicrophone");
    _lbl.setAttribute("class", "mic-label");
    _lbl.innerText = "Microphone : Off";
    buttondiv.append(_lbl);

    _speakNowButton = document.createElement("button");
    _speakNowButton.setAttribute("type", "button");
    _speakNowButton.setAttribute("id", "id_start");
    _speakNowButton.setAttribute("class", "btn-start");
    _speakNowButton.setAttribute("title", "Start");
    buttondiv.append(_speakNowButton);

    _speakNowButton = document.createElement("button");
    _speakNowButton.setAttribute("type", "button");
    _speakNowButton.setAttribute("class", "btn-stop");
    _speakNowButton.setAttribute("id", "id_pause");
    _speakNowButton.setAttribute("disabled", "disabled");
    _speakNowButton.setAttribute("title", "Pause");
    buttondiv.append(_speakNowButton);

    //added
    _speakNowButton = document.createElement("button");
    _speakNowButton.setAttribute("type", "button");
    _speakNowButton.setAttribute("class", "btn-reset");
    _speakNowButton.setAttribute("id", "id_reset");
    _speakNowButton.setAttribute("title", "Reset");
    buttondiv.append(_speakNowButton);

    // Input Elements
    var divText = document.createElement("div");
    this._inputText = document.createElement("textarea");
    this._inputText.setAttribute("class", "input-text");
    this._inputText.setAttribute("id", "id_final");
    this._inputText.setAttribute("title", "Text");
    this._inputText.value = this._value;
    divText.append(this._inputText);

    _container.append(divStartLeft);
    _container.append(buttondiv);
    _container.append(divStartRight);
    _container.append(divText);

    let scriptNode = document.createElement("script");
    scriptNode.setAttribute("type", "text/javascript");
    scriptNode.innerHTML =
      "let vmaxlen=2000;let vlisten=false;" +
      "let vlng=[['fr-FR','French'],['es-ES','Spanish'],['cmn-Hans-CN','Chinese Mandarin']];" +
      "let vfdq=(n)=>{return document.querySelector(n);};let vslng=vfdq('#id_lang');" +
      "for(let ln=0;ln<vlng.length;ln++){vslng.add(new Option(vlng[ln][1],vlng[ln][0]));};" +
      "if(typeof window !=='undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition || " +
      "window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition)){" +
      "let vcsr=(window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || " +
      "window.msSpeechRecognition || window.oSpeechRecognition);let vsr=new vcsr();let vft='';let vstxt='';" +
      "let vstmptxt='';let vbflg=false;vsr.interimResults=true;" +
      "function fpause(){vfdq('#id_labelMicrophone').innerHTML='Microphone : Off';vsr.stop();" +
      "vfdq('#id_final').readOnly=false;vfdq('#id_lang').disabled=false;vfdq('#id_reset').disabled=false;" +
      "vfdq('#id_start').disabled=false;vfdq('#id_pause').disabled=true;};" +
      "vsr.onresult=(e)=>{if(vstxt.length<=vmaxlen){let vit='';vbflg=false;" +
      "for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal){" +
      "vft+=e.results[i][0].transcript;vbflg=true;}else{vit+=e.results[i][0].transcript;vbflg=false;}}" +
      "if(vbflg){vstmptxt=vstxt+vft;}else{vstmptxt=vstxt+vft+vit;}" +
      "vfdq('#id_final').value=vstmptxt.substring(0,(vmaxlen-vstxt.length));}};" +
      "vfdq('#id_reset').onclick=()=>{vfdq('#id_final').value='';vft='';};" +
      "vfdq('#id_start').onclick=(e)=>{vfdq('#id_labelMicrophone').innerHTML='Microphone : On';vft=' ';" +
      "vstxt=vfdq('#id_final').value;vfdq('#id_final').readOnly=true;vsr.lang=vfdq('#id_lang').value;" +
      "vfdq('#id_lang').disabled=true;vfdq('#id_reset').disabled=true;vfdq('#id_pause').disabled=false;" +
      "vfdq('#id_start').disabled=true;vsr.continuous=true;vsr.start();};" +
      "vfdq('#id_pause').onclick=(e)=>{fpause();};vsr.addEventListener('error',()=>{fpause();});" +
      "vfdq('#id_hid').addEventListener('change',()=>{fpause();});" +
      "}else{alert('Speech recognition not available');}";

    _container.append(scriptNode);
    container.append(_container);
  }

  public RefreshData() {
    this._value = this._inputText.value as any as string;
    this._notifyOutputChanged();
  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    //Add code to update control view
    this._inputText.value = this._value;
    if (this._value === context.parameters.TextVal.raw) {
      this._inputText.value = this._value;
    } else {
      this._inputText.value =
        context.parameters.TextVal.raw === null
          ? ""
          : context.parameters.TextVal.raw;
    }
    if (this._langSelect.value != context.parameters.Language.raw) {
      this._langSelect.value =
        context.parameters.Language.raw == null
          ? "en-US"
          : context.parameters.Language.raw;
    }
    this._notifyOutputChanged();
    console.log("Update View Called");
    this.RefreshData();
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
   */
  public getOutputs(): IOutputs {
    return {
      TextVal: this._inputText.value,
      Language: this._langSelect.value,
      TriggerVal: "",
    };
  }

  public destroy(): void {
    // Add code to cleanup control if necessary
  }
}
