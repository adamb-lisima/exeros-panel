import { SharedEvent } from 'src/app/store/web-socket/web-socket.model';
import { MapVehiclesElement } from '../store/common-objects/common-objects.model';

export const FleetUtil = {
  updateFleetInList: ({ lat, lng, direction, deviceno }: SharedEvent, fleetVehicles: MapVehiclesElement[]): MapVehiclesElement[] | undefined => {
    const index = fleetVehicles?.findIndex(vehicle => vehicle.device_id === deviceno);
    if (index > -1) {
      const newVehicles = [...fleetVehicles];
      const newVehicle = { ...newVehicles[index] };
      newVehicle.last_coordinates = lat && lng ? [lat, lng] : newVehicle.last_coordinates;
      newVehicle.direction = direction ? direction : newVehicle.direction;
      newVehicles[index] = newVehicle;
      return newVehicles;
    }
    return undefined;
  }
};
