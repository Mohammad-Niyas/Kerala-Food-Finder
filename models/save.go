package models

import "gorm.io/gorm"

type Save struct {
	gorm.Model
	DishID uint
	Dish   Dish
}