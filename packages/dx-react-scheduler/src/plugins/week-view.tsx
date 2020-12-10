import * as React from 'react';
import {
  Template,
  Plugin,
  TemplateConnector,
  TemplatePlaceholder,
  PluginComponents,
  Getter,
} from '@devexpress/dx-react-core';
import {
  viewCellsData as viewCellsDataCore,
  calculateWeekDateIntervals,
  VIEW_TYPES,
  getTimeTableHeight,
  timeCellsData as timeCellsDataCore,
  computed,
} from '@devexpress/dx-scheduler-core';
import { BasicView } from './basic-view';
import { WeekViewProps } from '../types';
import { memoize } from '@devexpress/dx-core';

const DAYS_IN_WEEK = 7;
const viewCellsDataBaseComputed = (
  cellDuration, startDayHour, endDayHour,
) => ({ firstDayOfWeek, intervalCount, excludedDays, currentDate }) => {
  return viewCellsDataCore(
    currentDate, firstDayOfWeek,
    intervalCount! * DAYS_IN_WEEK, excludedDays!,
    startDayHour!, endDayHour!, cellDuration!,
    Date.now(),
  );
};
const calculateAppointmentsIntervalsBaseComputed = cellDuration => ({
  appointments, startViewDate, endViewDate, excludedDays,
}) => calculateWeekDateIntervals(
  appointments, startViewDate, endViewDate, excludedDays, cellDuration,
);
const timeCellsDataComputed = (startDayHour, endDayHour) => ({
  viewCellsData, cellDuration,
}) => timeCellsDataCore(viewCellsData, startDayHour, endDayHour, cellDuration, Date.now());

const TimeScalePlaceholder = () => <TemplatePlaceholder name="timeScale" />;

class WeekViewBase extends React.PureComponent<WeekViewProps> {
  static defaultProps: Partial<WeekViewProps> = {
    startDayHour: 0,
    endDayHour: 24,
    cellDuration: 30,
    intervalCount: 1,
    excludedDays: [],
    name: 'Week',
  };

  static components: PluginComponents = {
    layoutComponent: 'Layout',
    layoutContainerComponent: 'LayoutContainer',
    appointmentLayerComponent: 'AppointmentLayer',
    dayScaleEmptyCellComponent: 'DayScaleEmptyCell',
    timeScaleLayoutComponent: 'TimeScaleLayout',
    timeScaleLabelComponent: 'TimeScaleLabel',
    timeScaleTickCellComponent: 'TimeScaleTickCell',
    timeScaleTicksRowComponent: 'TimeScaleTicksRow',
    dayScaleLayoutComponent: 'DayScaleLayout',
    dayScaleCellComponent: 'DayScaleCell',
    dayScaleRowComponent: 'DayScaleRow',
    timeTableContainerComponent: 'TimeTableContainer',
    timeTableLayoutComponent: 'TimeTableLayout',
    timeTableCellComponent: 'TimeTableCell',
    timeTableRowComponent: 'TimeTableRow',
  };

  timeCellsDataComputed = memoize((viewName, startDayHour, endDayHour) => getters => computed(
    getters,
    viewName,
    timeCellsDataComputed(startDayHour, endDayHour),
    getters.timeCellsData,
  ));

  render() {
    const {
      layoutComponent,
      dayScaleEmptyCellComponent,
      timeScaleLayoutComponent: TimeScale,
      timeScaleLabelComponent: TimeScaleLabel,
      timeScaleTickCellComponent,
      timeScaleTicksRowComponent,
      dayScaleLayoutComponent,
      dayScaleCellComponent,
      dayScaleRowComponent,
      timeTableLayoutComponent,
      timeTableRowComponent,
      timeTableCellComponent,
      cellDuration,
      excludedDays,
      name: viewName,
      appointmentLayerComponent,
      intervalCount,
      displayName,
      startDayHour,
      endDayHour,
    } = this.props;

    return (
      <Plugin
        name="WeekView"
      >
        <BasicView
          viewCellsDataComputed={viewCellsDataBaseComputed}
          type={VIEW_TYPES.WEEK}
          cellDuration={cellDuration}
          name={viewName}
          intervalCount={intervalCount}
          displayName={displayName}
          startDayHour={startDayHour}
          endDayHour={endDayHour}
          excludedDays={excludedDays}
          calculateAppointmentsIntervals={calculateAppointmentsIntervalsBaseComputed}
          dayScaleEmptyCellComponent={dayScaleEmptyCellComponent}
          dayScaleLayoutComponent={dayScaleLayoutComponent}
          dayScaleCellComponent={dayScaleCellComponent}
          dayScaleRowComponent={dayScaleRowComponent}
          timeTableCellComponent={timeTableCellComponent}
          timeTableLayoutComponent={timeTableLayoutComponent}
          timeTableRowComponent={timeTableRowComponent}
          appointmentLayerComponent={appointmentLayerComponent}
          layoutComponent={layoutComponent}
          layoutProps={{
            timeScaleComponent: TimeScalePlaceholder,
          }}
        />

        <Getter
          name="timeCellsData"
          computed={this.timeCellsDataComputed(viewName, startDayHour, endDayHour)}
        />

        <Template name="timeScale">
          {(params: any) => (
            <TemplateConnector>
              {({
                currentView, timeCellsData, groups, formatDate,
                groupOrientation: getGroupOrientation,
                timeTableElementsMeta,
              }) => {
                if (currentView.name !== viewName) return <TemplatePlaceholder />;
                const groupOrientation = getGroupOrientation?.(viewName);

                return (
                  <TimeScale
                    labelComponent={TimeScaleLabel}
                    tickCellComponent={timeScaleTickCellComponent}
                    rowComponent={timeScaleTicksRowComponent}
                    cellsData={timeCellsData}
                    formatDate={formatDate}
                    groups={groups}
                    groupOrientation={groupOrientation}
                    height={getTimeTableHeight(timeTableElementsMeta)}
                    {...params}
                  />
                );
              }}
            </TemplateConnector>
          )}
        </Template>
      </Plugin>
    );
  }
}

// tslint:disable: max-line-length
/***
 * A plugin that renders the Scheduler's week view. This plugin arranges appointments from top to bottom.
 * If their time intervals overlap, their width is decreased and they are placed next to each other.
 * */
export const WeekView: React.ComponentType<WeekViewProps> = WeekViewBase;
