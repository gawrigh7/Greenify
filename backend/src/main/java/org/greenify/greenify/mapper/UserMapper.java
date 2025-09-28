package org.greenify.greenify.mapper;

import org.greenify.greenify.dto.UserCreateDto;
import org.greenify.greenify.dto.UserDto;
import org.greenify.greenify.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) return null;
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        return dto;
    }

    public User fromCreateDto(UserCreateDto req) {
        if (req == null) return null;
        User u = new User();
        u.setUsername(req.getUsername());
        u.setEmail(req.getEmail());
        u.setPassword(req.getPassword());
        return u;
    }
}
