/**
 * Copyright 2019 Carnegie Technologies
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @file Decoder for Level Sensor payloads
 */

import { DecodedPayload, Header } from '../interfaces';

/**
 * Interface for a level sensor event
 */
export interface LevelSensorEvent {
    occupancy: number;
    dataStatus: number;
    range: string;
    signalRate: string;
    ambientRate: string;
    sigma: string;
    pixelCount: number;
}

/**
 * A decoded level sensor payload
 */
export interface DecodedLevelSensorPayload extends DecodedPayload {
    header: Header;
    body: LevelSensorEvent;
}

const ACK_INDEX = 0;
const STATUS_INDEX = 1;
const BATTERY_VOLTAGE_INDEX = 2;
const MESSAGE_ID_INDEX = 3;
const SIZE_INDEX = 4;

const OCCUPANCY_INDEX = 5;
const DATA_STATUS_INDEX = 6;
const RANGE_INDEX = 7;
const SIGNAL_RATE_INDEX = 9;
const AMBIENT_RATE_INDEX = 11;
const SIGMA_INDEX = 13;
const PIXEL_COUNT_INDEX = 15;

/**
 * Get the battery voltage for a level sensor
 */
export function decodeBatteryVoltageByte(byte: number): number {
    //tslint:disable-next-line no-magic-numbers
    return (byte * 256) / 5000;
}

export function decoder(payloadBuffer: Buffer): DecodedLevelSensorPayload {
    //tslint:disable no-magic-numbers
    const header: Header = {
        ack: payloadBuffer.readUInt8(ACK_INDEX).toString(16).padStart(2, '0'),
        status: payloadBuffer.readUInt8(STATUS_INDEX).toString(16).padStart(2, '0'),
        batteryVoltage: decodeBatteryVoltageByte(payloadBuffer.readUInt8(BATTERY_VOLTAGE_INDEX)),
        messageId: payloadBuffer.readUInt8(MESSAGE_ID_INDEX).toString(16).padStart(2, '0'),
        size: payloadBuffer.readUInt8(SIZE_INDEX).toString(16).padStart(2, '0')
    };

    const levelSensorEvent: LevelSensorEvent = {
        occupancy: payloadBuffer[OCCUPANCY_INDEX],
        dataStatus: payloadBuffer[DATA_STATUS_INDEX],
        range: payloadBuffer.readInt16LE(RANGE_INDEX).toString().padStart(4, '0'),
        signalRate: payloadBuffer.readInt16LE(SIGNAL_RATE_INDEX).toString().padStart(4, '0'),
        ambientRate: payloadBuffer.readInt16LE(AMBIENT_RATE_INDEX).toString().padStart(4, '0'),
        sigma: payloadBuffer.readInt16LE(SIGMA_INDEX).toString().padStart(4, '0'),
        pixelCount: payloadBuffer[PIXEL_COUNT_INDEX]
    };
    //tslint:enable no-magic-numbers

    return {
        header,
        body: levelSensorEvent
    };
}
