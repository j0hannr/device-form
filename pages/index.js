import Link from "next/link";
import Logic from "../lib/device-form-logic.json";
import { useState, useEffect } from "react";

export default function IndexPage() {
  // default state
  const reelDefault = {
    form: null, // id of form used
    state: false, // determining the visibility of the form
    select: "single", // number of choice single || multiple
    location: undefined, // location in the device Object
    name: "Ein Gerät hinzufügen",
    description: "Wähle ein Gerät aus",
    content: Logic,
    value: null, // value of current form step
    step: undefined, // current step in form
  };
  const [reelObject, setReelObject] = useState(reelDefault);
  const [deviceObject, setDeviceObject] = useState({});
  let currentValue = undefined; // string or array depending on select
  // const [value, setValue] = useState(null)
  const [checked, setChecked] = useState(false);
  const [success, setSuccess] = useState(false);

  /**
   *
   * todo
   * ---
   * - set device with logic layout (remove given parameter)
   * - use object to store reel data
   * - update device object with reel data
   * - success screen
   * - checkbox logic
   * - select previous answer on back
   * - all option for checkbox logic
   *
   * requirements
   * ---
   * - go on button or select
   * - radio or multi options
   * - write any data to device properties or meta
   *
   */

  function openReel() {
    setSuccess(false);
    setReelObject(reelDefault);
    setReelObject((reelObject) => ({ ...reelObject, state: true }));
  }

  function state() {
    console.log("state", reelObject);
  }

  function closeReel() {
    setReelObject((reelObject) => ({ ...reelObject, state: false }));
  }

  function forward() {
    // if reelObject.select is multiple set currentValue to checked
    if (reelObject.select === "multiple") {
      currentValue = checked.map((item, index) => (item ? reelObject.content[index].value : null)).filter((item) => item !== null);
    }
    // init
    if (reelObject.step === undefined) {
      setDeviceObject(Logic.find((x) => x.value === currentValue)._object);
      setReelObject((reelObject) => ({ ...reelObject, form: currentValue }));
      updateReelObject(0, Logic.find((x) => x.value === currentValue)?.steps[0]);
    }
    // last
    else if (reelObject.step === Logic.find((x) => x.value === reelObject.form).steps.length - 1) {
      setDeviceObject((deviceObject) => ({ ...deviceObject, [reelObject.location]: currentValue }));
      setSuccess(true);
    }
    // step
    else if (reelObject.step >= 0) {
      console.log("multi", [reelObject.location], currentValue);
      setDeviceObject((deviceObject) => ({ ...deviceObject, [reelObject.location]: currentValue }));
      updateReelObject(reelObject.step + 1);
    }
  }

  function back() {
    if (reelObject.step > 0) {
      success ? setSuccess(false) :  updateReelObject(reelObject.step - 1)
    } else if (reelObject.step === 0) {
      openReel();
    }
  }

  // update currentValue from checkbox
  function handleOnChange(position) {
    setChecked(checked.map((item, index) => (index === position ? !item : item)));
  }

  function updateReelObject(step = reelObject.step ? reelObject.step : 0, thisLogic) {
    if (!thisLogic) {
      thisLogic = Logic.find((x) => x.value === reelObject.form).steps[step];
    }

    setChecked(Array(thisLogic.options?.length).fill(false));

    console.log(thisLogic, checked);

    thisLogic &&
      setReelObject((reelObject) => ({
        ...reelObject,
        name: thisLogic.name,
        description: thisLogic.description,
        content: thisLogic.options,
        select: thisLogic.select,
        location: thisLogic.location,
        step: step,
      }));
  }

  return (
    <div>
      <p>Device Form Demo</p>
      <button type="button" onClick={openReel}>
        Gerät hinzufügen
      </button>

      <hr></hr>

      {/* selector reel used for everything */}
      {reelObject.state && (
        <div>
          <h1>{reelObject.name}</h1>
          <p>{reelObject.description}</p>
          {reelObject.content &&
            !success &&
            reelObject.content.map((item, index) => {
              return (
                <div key={index + item.name}>
                  <label htmlFor={index + item.name}>{item.name}</label>
                  <input
                    type={reelObject.select === "single" ? "radio" : "checkbox"}
                    id={index + item.name}
                    name="reel"
                    value={item.value}
                    onChange={() => {
                      currentValue = item.value;
                      reelObject.select === "single" && forward();
                      reelObject.select === "multiple" && handleOnChange(index);
                    }}
                  />
                  <p>{item.description}</p>
                </div>
              );
            })}

          {success && (
            <div>
              <h2>Finished</h2>
              <pre>{JSON.stringify(deviceObject, 0, 2)}</pre>
            </div>
          )}

          {reelObject.select === "multiple" && (
            <button type="button" onClick={forward}>
              Weiter
            </button>
          )}

          <br></br>
          <button type="button" onClick={state}>
            Get State
          </button>
          <br></br>
          {reelObject.step >= 0 && (
            <button type="button" onClick={back}>
              Back
            </button>
          )}
          <br></br>
          <button type="button" onClick={closeReel}>
            Close
          </button>
        </div>
      )}

      <br></br>
      <hr></hr>
      <details>
        <summary>Device Object</summary>
        <pre>{JSON.stringify(deviceObject, 0, 2)}</pre>
      </details>
      {/* <br></br> */}
      {/* <hr></hr> */}
      <details>
        <summary>Reel Object</summary>
        <pre>{JSON.stringify(reelObject.content, 0, 2)}</pre>
      </details>
    </div>
  );
}
