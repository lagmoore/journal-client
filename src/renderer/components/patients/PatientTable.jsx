// src/renderer/components/patients/PatientTable.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const PatientTable = ({ patients, onViewPatient }) => {
  const { t } = useTranslation();
  
  // Format date to local string
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <div className="overflow-x-auto rounded-lg border border-base-300">
      <table className="min-w-full divide-y divide-base-300">
        <thead className="bg-base-200">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
              {t('patients.fields.name')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
              {t('patients.fields.personalNumber')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
              {t('patients.fields.contact')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
              {t('patients.fields.status')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">
              {t('patients.fields.createdAt')}
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral uppercase tracking-wider">
              {t('patients.fields.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-base-100 divide-y divide-base-300">
          {patients.map((patient) => (
            <tr 
              key={patient.id} 
              className="hover:bg-base-200 cursor-pointer"
              onClick={() => onViewPatient(patient.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="font-medium">{`${patient.lastName}, ${patient.firstName}`}</div>
                    {patient.dateOfBirth && (
                      <div className="text-sm text-neutral">
                        {`${t('patients.fields.dob')}: ${formatDate(patient.dateOfBirth)}`}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {patient.personalNumber || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  {patient.email && (
                    <div className="text-sm">{patient.email}</div>
                  )}
                  {patient.phone && (
                    <div className="text-sm">{patient.phone}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  patient.isActive
                    ? 'bg-success bg-opacity-10 text-success'
                    : 'bg-error bg-opacity-10 text-error'
                }`}>
                  {patient.isActive 
                    ? t('patients.status.active') 
                    : t('patients.status.inactive')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral">
                {formatDate(patient.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  className="text-primary hover:text-primary-focus"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewPatient(patient.id);
                  }}
                >
                  {t('patients.actions.view')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;