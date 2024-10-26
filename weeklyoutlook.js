import React, { Component } from 'react';
import './weatherforecast.css';

class WeeklyOutlook extends Component {
  constructor() {
    super();
    this.state = {
      city: '',
      weeklyData: null,
      selectedWeek: null,
      error: null,
    };
  }

  handleCityChange = (event) => {
    this.setState({ city: event.target.value });
  };

  fetchWeeklyData = async () => {
    const { city } = this.state;

    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=dda91d395e5ec4bc1575437970d8d048
      `);
      const data = await response.json();

      if (response.ok) {
        if (data.cod === '200' && data.list && data.list.length > 0) {
          const weeklyData = this.groupDataByWeek(data.list);
          this.setState({ weeklyData, selectedWeek: null, error: null });
        } else {
          console.error('Error fetching weekly outlook data:', data.message || response.statusText);
          this.setState({ error: 'No City Found!' });
        }
      } else {
        console.error('Error fetching weekly outlook data:', data.message || response.statusText);
        this.setState({ error: 'No City Found!' });
      }
    } catch (error) {
      console.error('Error fetching weekly outlook data:', error.message);
      this.setState({ error: 'Error fetching data. Please try again later.' });
    }
  };

  groupDataByWeek = (data) => {
    const weeklyData = [];
    let currentWeek = [];
  
    data.forEach((day, index) => {
      currentWeek.push(day);
  
      if (currentWeek.length === 7) {
        weeklyData.push([...currentWeek]);
        currentWeek = [];
      } else if (index === data.length - 1) {
        // If it's the last day and doesn't complete a week, add it to the last week
        weeklyData.push([...currentWeek]);
      }
    });
  
    return weeklyData;
  };
  
  
  


  handleWeekClick = (index) => {
    this.setState({ selectedWeek: index });
  };

  renderWeeklyOutlook() {
    const { weeklyData, selectedWeek, error } = this.state;

    return (
      <div className="weekly-outlook-container">
        <h1 className="weekly-outlook-header">Weekly Outlook</h1>
        <div className="weekly-outlook-content">
          <label>Enter City: </label>
          <input type="text" value={this.state.city} onChange={this.handleCityChange} />
          <button onClick={this.fetchWeeklyData}>Get Weekly Outlook</button>

          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            weeklyData && (
              <div className="horizontal-scroll">
                {weeklyData.map((week, index) => (
                  <div
                    key={index}
                    className={`weekly-outlook-item ${index === selectedWeek ? 'selected' : ''}`}
                    onClick={() => this.handleWeekClick(index)}
                  >
                    <p className="week-title">Week {index + 1} ({this.formatDate(week[0].dt)} - {this.formatDate(week[week.length - 1].dt)})</p>
                    <p>Average Temperature: {this.calculateAverageTemperature(week)}°C</p>
                    <p>Average Humidity: {this.calculateAverageHumidity(week)}%</p>
                    <div className="daily-details">
                      {week.map((day, dayIndex) => (
                        <div key={dayIndex} className="day-details">
                          <p>{this.formatDate(day.dt)}</p>
                          <p>Temperature: {day.main.temp}°C</p>
                          <p>Humidity: {day.main.humidity}%</p>
                          <p>Description: {day.weather[0].description}</p>
                          <img
                            src={`https://openweathermap.org/img/w/${day.weather[0].icon}.png`}
                            alt={day.weather[0].description}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {selectedWeek !== null && (
            <div className="weather-popup">
              <p>Popup for selected week:</p>
              {/* Add details for the selected week popup */}
            </div>
          )}
        </div>
      </div>
    );
  }

  calculateAverageTemperature = (week) => {
    const sumTemperature = week.reduce((sum, day) => sum + day.main.temp, 0);
    return (sumTemperature / week.length).toFixed(2);
  };

  calculateAverageHumidity = (week) => {
    const sumHumidity = week.reduce((sum, day) => sum + day.main.humidity, 0);
    return (sumHumidity / week.length).toFixed(2);
  };

  formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  render() {
    return (
      <div className="weekly-outlook-wrapper">
        {this.renderWeeklyOutlook()}
      </div>
    );
  }
}

export default WeeklyOutlook;
