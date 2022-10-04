import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { State } from 'RootStateType';
import { createWrappedAsync } from './shared/createWrappedAsync';
import rootRquest from './rootRquest';

export type Location = {
  id: number;
  name: string;
};

const locationsAdapter = createEntityAdapter<Location>();

export const getLocations = createWrappedAsync<any, boolean, { state: State }>(
  'locations/get',
  async () => {
    const response = await rootRquest.get(`/api/locations`);

    return response.data;
  },
  {
    condition: (_, { getState }) => getState().locations.ids.length === 0,
  },
);

export const postLocation = createWrappedAsync(
  'locations/post',
  async (newLocation: Omit<Location, 'id'>) => {
    const response = await rootRquest.post(`/api/locations/`, newLocation);

    return response.data;
  },
);

export const deleteLocation = createWrappedAsync('locations/delete', async (id: number) => {
  await rootRquest.delete(`/api/locations/${id}/`);
  return id;
});

const locationSlice = createSlice({
  name: 'locations',
  initialState: locationsAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getLocations.fulfilled, locationsAdapter.setAll)
      .addCase(postLocation.fulfilled, locationsAdapter.addOne)
      .addCase(deleteLocation.fulfilled, locationsAdapter.removeOne);
  },
});

const { reducer } = locationSlice;

export default reducer;

export const {
  selectAll: selectAllLocations,
  selectById: selectLocationById,
  selectEntities: selectLocationEntities,
} = locationsAdapter.getSelectors<State>((state) => state.locations);
