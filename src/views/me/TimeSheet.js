import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import ActionButton from 'utils/ActionButton';
import apiCalls from 'apicall';
import { useEffect } from 'react';

const TimeSheet = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [alProject, setAllProject] = useState([]);
  const [formData, setFormData] = useState({
    projectName: '',
    description: ''
  });

  useEffect(() => {
    getAllProject();
  }, []);

  const getAllProject = async () => {
    try {
      const result = await apiCalls('get', `master/getProjectMasterByOrgId?orgId=${orgId}`);
      setAllProject(result.paramObjectsMap.projectMasterVO);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log('Submitted Data:', { date: selectedDate, ...formData });
    setModalOpen(false);
    setFormData({ projectName: '', description: '' });
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleClear = () => {
    setSelectedDate(null);
    setModalOpen(false);
    setFormData({
      projectName: '',
      description: ''
    });
  };

  const handleModalClear = () => {
    setFormData({
      projectName: '',
      description: ''
    });
  };

  return (
    <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
      <div className="row d-flex ml">
        <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
          <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
          <ActionButton
            title="Save"
            icon={SaveIcon}
            isLoading={isLoading}
            // onClick={handleSave}
            margin="0 10px 0 10px"
          />
        </div>
      </div>
      <div className="d-flex justify-content-center">
        <div className="calendar-wrapper shadow p-4 rounded bg-white">
          <Calendar onClickDay={handleDateClick} />
        </div>
      </div>

      {/* Bootstrap Modal */}
      {modalOpen && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title">Add Entry for {selectedDate.toDateString()}</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Project Name</label>
                  <select name="projectName" value={formData.projectName} onChange={handleChange} className="form-select">
                    <option value="">Select Project</option>
                    {alProject.map((project) => (
                      <option key={project.id} value={project.projectCode}>
                        {project.projectCode} - {project.projectName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Comments</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    placeholder="Enter comments"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-warning" onClick={handleModalClear}>
                  Clear
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSheet;
