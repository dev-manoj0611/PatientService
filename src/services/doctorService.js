const { Op } = require('sequelize');
const { Doctor } = require('../models');

class DoctorService {
  /**
   * Get all doctors with pagination and filters
   */
  async getAllDoctors(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.specialization) {
      where.specialization = filters.specialization;
    }
    if (filters.search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${filters.search}%` } },
        { lastName: { [Op.like]: `%${filters.search}%` } },
        { email: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    const { rows, count } = await Doctor.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    return {
      doctors: rows,
      total: count,
      page,
      limit
    };
  }

  /**
   * Get doctor by ID
   */
  async getDoctorById(doctorId) {
    try {
      const doctor = await Doctor.findByPk(doctorId);

      if (!doctor) {
        const error = new Error('Doctor not found');
        error.statusCode = 404;
        throw error;
      }

      return doctor;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify doctor exists and is active
   */
  async verifyDoctor(doctorId) {
    try {
      const doctor = await this.getDoctorById(doctorId);

      if (doctor.status !== 'active') {
        const error = new Error(
          `Doctor is not available (status: ${doctor.status})`
        );
        error.statusCode = 400;
        throw error;
      }

      return doctor;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new DoctorService();
