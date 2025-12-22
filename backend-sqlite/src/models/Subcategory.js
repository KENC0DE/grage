const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subcategory = sequelize.define('Subcategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Subcategory name is required' },
      len: {
        args: [1, 100],
        msg: 'Subcategory name must be between 1 and 100 characters'
      }
    }
  },
  slug: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Description cannot exceed 500 characters'
      }
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    comment: 'Estimated duration in minutes'
  },
  priceMin: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  priceMax: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'subcategories',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['categoryId', 'name']
    }
  ],
  hooks: {
    beforeValidate: (subcategory) => {
      if (subcategory.name && (!subcategory.slug || subcategory.changed('name'))) {
        subcategory.slug = subcategory.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .trim();
      }
    }
  }
});

module.exports = Subcategory;
