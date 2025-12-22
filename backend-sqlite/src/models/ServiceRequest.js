const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ServiceRequest = sequelize.define('ServiceRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  requestNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Customer name is required' }
    }
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Customer phone is required' }
    }
  },
  customerEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: { msg: 'Please provide a valid email' }
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  subcategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subcategories',
      key: 'id'
    }
  },
  // Address fields
  addressStreet: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  addressCity: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  addressState: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  addressZipCode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  addressFull: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Full address is required' }
    }
  },
  // Location coordinates
  locationLatitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: -90,
      max: 90,
      notNull: { msg: 'Location latitude is required' }
    }
  },
  locationLongitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: -180,
      max: 180,
      notNull: { msg: 'Location longitude is required' }
    }
  },
  addressPin: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Address pin cannot exceed 500 characters'
      }
    }
  },
  preferredDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notNull: { msg: 'Preferred service date is required' },
      isDate: true
    }
  },
  preferredTime: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Preferred service time is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Description is required' },
      len: {
        args: [1, 2000],
        msg: 'Description must be between 1 and 2000 characters'
      }
    }
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    comment: 'JSON array of image URLs'
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'assigned',
      'accepted',
      'in_progress',
      'completed',
      'cancelled',
      'rejected'
    ),
    defaultValue: 'pending',
    allowNull: false
  },
  assignedToId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    allowNull: false
  },
  estimatedCost: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  actualCost: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    comment: 'JSON array of notes'
  },
  statusHistory: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    comment: 'JSON array of status history'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'service_requests',
  timestamps: true,
  hooks: {
    beforeCreate: async (serviceRequest) => {
      // Generate unique request number
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      // Count today's requests
      const count = await ServiceRequest.count({
        where: {
          createdAt: {
            [sequelize.Sequelize.Op.gte]: new Date(year, date.getMonth(), day),
            [sequelize.Sequelize.Op.lt]: new Date(year, date.getMonth(), day + 1)
          }
        }
      });

      serviceRequest.requestNumber = `SR${year}${month}${day}${String(count + 1).padStart(4, '0')}`;
    },
    beforeUpdate: (serviceRequest) => {
      // Update completion/cancellation dates
      if (serviceRequest.changed('status')) {
        if (serviceRequest.status === 'completed' && !serviceRequest.completedAt) {
          serviceRequest.completedAt = new Date();
        }
        if (serviceRequest.status === 'cancelled' && !serviceRequest.cancelledAt) {
          serviceRequest.cancelledAt = new Date();
        }
      }
    }
  }
});

// Instance methods
ServiceRequest.prototype.addNote = function(userId, noteText) {
  const notes = JSON.parse(this.notes || '[]');
  notes.push({
    userId,
    note: noteText,
    createdAt: new Date().toISOString()
  });
  this.notes = JSON.stringify(notes);
  return this.save();
};

ServiceRequest.prototype.updateStatusWithHistory = function(newStatus, userId, comment) {
  const history = JSON.parse(this.statusHistory || '[]');
  history.push({
    status: newStatus,
    changedBy: userId,
    changedAt: new Date().toISOString(),
    comment: comment || ''
  });
  this.statusHistory = JSON.stringify(history);
  this.status = newStatus;
  return this.save();
};

ServiceRequest.prototype.getImages = function() {
  try {
    return JSON.parse(this.images || '[]');
  } catch (e) {
    return [];
  }
};

ServiceRequest.prototype.getNotes = function() {
  try {
    return JSON.parse(this.notes || '[]');
  } catch (e) {
    return [];
  }
};

ServiceRequest.prototype.getStatusHistory = function() {
  try {
    return JSON.parse(this.statusHistory || '[]');
  } catch (e) {
    return [];
  }
};

module.exports = ServiceRequest;
