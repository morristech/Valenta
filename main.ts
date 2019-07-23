﻿
/**
  * Enumeration of motors.
  */
enum THMotor
{
    //% block="motor 1"
    M1,
    //% block="motor 2"
    M2,
    //% block="both"
    Both
}

/**
  * Enumeration of directions.
  */
enum THRobotDirection
{
    //% block="left"
    Left,
    //% block="right"
    Right
}

/**
  * Stop modes. Coast or Brake
  */
enum THStopMode
{
    //% block="no brake"
    Coast,
    //% block="brake"
    Brake
}

/**
  * Update mode for LEDs
  * setting to Manual requires show LED changes blocks
  * setting to Auto will update the LEDs everytime they change
  */
enum THMode
{
    Manual,
    Auto
}

/**
  * Model Types of TH_Board
  * Zero or Plus
  */
enum THModel
{
    Zero,
    Plus
}


/**
  * Pre-Defined LED colours
  */
enum THColors
{
    //% block=red
    Red = 0xff0000,
    //% block=orange
    Orange = 0xffa500,
    //% block=yellow
    Yellow = 0xffff00,
    //% block=green
    Green = 0x00ff00,
    //% block=blue
    Blue = 0x0000ff,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xff00ff,
    //% block=white
    White = 0xffffff,
    //% block=black
    Black = 0x000000
}

/**
 * Custom blocks
 */
//% weight=50 color=#e7660b icon="\uf079"
namespace THBoards
{
    let neoStrip: neopixel.Strip;
    let _updateMode = THMode.Auto;
    let _model = THModel.Zero;
    let lDir = 0;
    let rDir = 0;

    /**
      * Select Model of TH Board (Determines Pins used)
      *
      * @param model Model of TH Board; Zero or Plus
      */
    //% blockId="th_model" block="select TH Board model %model"
    //% weight=100
    export function th_model(model: THModel): void
    {
        _model = model;
    }

// Motor Blocks

    // slow PWM frequency for slower speeds to improve torque
    // only one PWM frequency available for all pins
    function setPWM(speed: number): void
    {
        if (speed < 200)
            pins.analogSetPeriod(AnalogPin.P12, 60000);
        else if (speed < 300)
            pins.analogSetPeriod(AnalogPin.P12, 40000);
        else
            pins.analogSetPeriod(AnalogPin.P12, 30000);
    }

    /**
      * Drive motor(s) forward or reverse.
      * @param motor motor to drive.
      * @param speed speed of motor (-1023 to 1023). eg: 600
      */
    //% blockId="th_motor" block="drive %motor|motor(s) at speed %speed"
    //% weight=50
    //% subcategory=Motors
    export function motor(motor: THMotor, speed: number): void
    {
        let reverse = 0;
        if (speed == 0)
        {
            stop(THStopMode.Coast);
            return;
        }
        if (speed < 0)
        {
            reverse = 1;
            speed = -speed;
        }
        setPWM(speed);
        if (_model == THModel.Plus)
        {
            if ((motor == THMotor.M1) || (motor == THMotor.Both))
            {
                pins.analogWritePin(AnalogPin.P12, speed);
                pins.digitalWritePin(DigitalPin.P13, reverse);
                lDir = reverse;
            }
            if ((motor == THMotor.M2) || (motor == THMotor.Both))
            {
                pins.analogWritePin(AnalogPin.P14, speed);
                pins.digitalWritePin(DigitalPin.P15, reverse);
                rDir = reverse;
            }
        }
        else // model == Zero
        {
            if ((motor == THMotor.M1) || (motor == THMotor.Both))
            {
                if (reverse == 0)
                {
                    pins.analogWritePin(AnalogPin.P12, speed);
                    pins.analogWritePin(AnalogPin.P13, 0);
                }
                else
                {
                    pins.analogWritePin(AnalogPin.P12, 0);
                    pins.analogWritePin(AnalogPin.P13, speed);
                }
            }
            if ((motor == THMotor.M2) || (motor == THMotor.Both))
            {
                if (reverse == 0)
                {
                    pins.analogWritePin(AnalogPin.P14, speed);
                    pins.analogWritePin(AnalogPin.P15, 0);
                }
                else
                {
                    pins.analogWritePin(AnalogPin.P14, 0);
                    pins.analogWritePin(AnalogPin.P15, speed);
                }
            }
        }
    }

    /**
      * Stop robot by coasting slowly to a halt or braking
      * @param mode Brakes on or off
      */
    //% blockId="th_stop" block="stop with %mode"
    //% weight=80
    //% subcategory=Motors
    export function stop(mode: THStopMode): void
    {
        let stopMode = 0;
        if (mode == THStopMode.Brake)
            stopMode = 1;
        if (_model == THModel.Zero)
        {
            pins.digitalWritePin(DigitalPin.P12, stopMode);
            pins.digitalWritePin(DigitalPin.P13, stopMode);
            pins.digitalWritePin(DigitalPin.P14, stopMode);
            pins.digitalWritePin(DigitalPin.P15, stopMode);
        }
        else
        {
            pins.digitalWritePin(DigitalPin.P12, 0);
            pins.digitalWritePin(DigitalPin.P13, lDir ^ stopMode);
            pins.digitalWritePin(DigitalPin.P14, 0);
            pins.digitalWritePin(DigitalPin.P15, rDir ^ stopMode);
        }
    }

    /**
      * Drive robot forward (or backward) at speed.
      * @param speed speed of motor between -1023 and 1023. eg: 600
      */
    //% blockId="th_drive" block="drive at speed %speed"
    //% speed.min=-1023 speed.max=1023
    //% weight=100
    //% subcategory=Motors
    export function drive(speed: number): void
    {
        motor(THMotor.Both, speed);
    }

    /**
      * Drive robot forward (or backward) at speed for milliseconds.
      * @param speed speed of motor between -1023 and 1023. eg: 600
      * @param milliseconds duration in milliseconds to drive forward for, then stop. eg: 400
      */
    //% blockId="th_drive_milliseconds" block="drive at speed %speed| for %milliseconds|(ms)"
    //% speed.min=-1023 speed.max=1023
    //% weight=70
    //% subcategory=Motors
    export function driveMilliseconds(speed: number, milliseconds: number): void
    {
        drive(speed);
        basic.pause(milliseconds);
        stop(THStopMode.Coast);
    }

    /**
      * Turn robot in direction at speed.
      * @param direction direction to turn.
      * @param speed speed of motor between 0 and 1023. eg: 600
      */
    //% blockId="th_spin" block="spin %direction|at speed %speed"
    //% speed.min=0 speed.max=1023
    //% weight=90
    //% subcategory=Motors
    export function spin(direction: THRobotDirection, speed: number): void
    {
        if (speed < 0)
            speed = 0;
        if (direction == THRobotDirection.Left)
        {
            motor(THMotor.M1, -speed);
            motor(THMotor.M2, speed);
        }
        else if (direction == THRobotDirection.Right)
        {
            motor(THMotor.M1, speed);
            motor(THMotor.M2, -speed);
        }
    }

    /**
      * Spin robot in direction at speed for milliseconds.
      * @param direction direction to spin
      * @param speed speed of motor between 0 and 1023. eg: 600
      * @param milliseconds duration in milliseconds to spin for, then stop. eg: 400
      */
    //% blockId="th_spin_milliseconds" block="spin %direction|at speed %speed| for %milliseconds|(ms)"
    //% speed.min=0 speed.max=1023
    //% weight=60
    //% subcategory=Motors
    export function spinMilliseconds(direction: THRobotDirection, speed: number, milliseconds: number): void
    {
        spin(direction, speed);
        basic.pause(milliseconds);
        stop(THStopMode.Coast);
    }


// LED Blocks

    // create a neopixel strip if not got one already. Default to brightness 40
    function neo(): neopixel.Strip
    {
        if (!neoStrip)
        {
            neoStrip = neopixel.create(DigitalPin.P13, 4, NeoPixelMode.RGB);
            neoStrip.setBrightness(40);
        }
        return neoStrip;
    }

    // update LEDs if _updateMode set to Auto
    function updateLEDs(): void
    {
        if (_updateMode == THMode.Auto)
            neo().show();
    }

    /**
      * Sets all LEDs to a given color (range 0-255 for r, g, b).
      * @param rgb RGB color of the LED
      */
    //% blockId="th_set_led_color" block="set all LEDs to %rgb=mb_colours"
    //% weight=100
    //% subcategory=LEDs
    export function setLedColor(rgb: number)
    {
        neo().showColor(rgb);
        updateLEDs();
    }

    /**
      * Clear all leds.
      */
    //% blockId="th_led_clear" block="clear all LEDs"
    //% weight=90
    //% subcategory=LEDs
    export function ledClear(): void
    {
        neo().clear();
        updateLEDs();
    }

    /**
     * Set single LED to a given color (range 0-255 for r, g, b).
     *
     * @param ledId position of the LED (0 to 11)
     * @param rgb RGB color of the LED
     */
    //% blockId="th_set_pixel_color" block="set LED at %ledId|to %rgb=mb_colours"
    //% weight=80
    //% subcategory=LEDs
    export function setPixelColor(ledId: number, rgb: number): void
    {
        neo().setPixelColor(ledId, rgb);
        updateLEDs();
    }

    /**
     * Set the brightness of the LEDs
     * @param brightness a measure of LED brightness in 0-255. eg: 40
     */
    //% blockId="th_led_brightness" block="set LED brightness %brightness"
    //% brightness.min=0 brightness.max=255
    //% weight=70
    //% subcategory=LEDs
    export function ledBrightness(brightness: number): void
    {
        neo().setBrightness(brightness);
        updateLEDs();
    }

    /**
      * Shows a rainbow pattern on all LEDs.
      */
    //% blockId="th_rainbow" block="set led rainbow"
    //% weight=60
    //% subcategory=LEDs
    export function ledRainbow(): void
    {
        neo().showRainbow(1, 360);
        updateLEDs()
    }

    /**
      * Get numeric value of colour
      *
      * @param color Standard RGB Led Colours
      */
    //% blockId="mb_colours" block=%color
    //% weight=50
    //% subcategory=LEDs
    export function THColours(color: THColors): number
    {
        return color;
    }

    // Advanced blocks

    /**
      * Set LED update mode (Manual or Automatic)
      * @param updateMode setting automatic will show LED changes automatically
      */
    //% blockId="th_set_updateMode" block="set %updateMode|update mode"
    //% weight=100
    //% advanced=true
    export function setUpdateMode(updateMode: THMode): void
    {
        _updateMode = updateMode;
    }

    /**
      * Show LED changes
      */
    //% blockId="led_show" block="show LED changes"
    //% weight=90
    //% advanced=true
    export function ledShow(): void
    {
        neo().show();
    }

    /**
     * Rotate LEDs forward.
     */
    //% blockId="th_led_rotate" block="rotate LEDs"
    //% weight=80
    //% advanced=true
    export function ledRotate(): void
    {
        neo().rotate(1);
        updateLEDs()
    }

    /**
     * Shift LEDs forward and clear with zeros.
     */
    //% blockId="th_led_shift" block="shift LEDs"
    //% weight=70
    //% subcategory=Leds
    //% advanced=true
    export function ledShift(): void
    {
        neo().shift(1);
        updateLEDs()
    }

    /**
      * Convert from RGB values to colour number
      *
      * @param red Red value of the LED (0 to 255)
      * @param green Green value of the LED (0 to 255)
      * @param blue Blue value of the LED (0 to 255)
      */
    //% blockId="bitbot_convertRGB" block="convert from red %red| green %green| blue %blue"
    //% weight=60
    //% advanced=true
    export function convertRGB(r: number, g: number, b: number): number
    {
        return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF);
    }

}