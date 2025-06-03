import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { error } from 'console';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatService {
  private baseUrl: string;

  private apiKey: string;

  constructor(private readonly usersService: UsersService) {
    this.baseUrl = process.env.DIFY_SPACE_URL;
  }

  setAPIKey(field: string) {
    let apiKey = '';
    switch (field) {
      case 'médecine':
        apiKey = process.env.DIFY_MED_KEY;
        break;
      case 'droits':
        apiKey = process.env.DIFY_LAW_KEY;
        break;
      case 'prepa':
        apiKey = process.env.DIFY_STEM_KEY;
        break;
      default:
        throw new Error();
    }
    return apiKey;
  }

  async getConversations(user: string): Promise<string> {
    const url = `${this.baseUrl}/conversations?user=${user}&limit=40`;
    const userObject = await this.usersService.findOneById(user);

    if (!userObject) throw error('User not found');

    const apiKey = this.setAPIKey(userObject.currentFieldOfStudy);

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log('Api key is not valid : ', apiKey);
      console.error('Error generating text with Dify.AI:', error);
      throw error;
    }
  }

  async getConversationMessages(
    user: string,
    conversation_id: string,
  ): Promise<string> {
    const url = `${this.baseUrl}/messages?user=${user}&conversation_id=${conversation_id}&limit=100`;
    const userObject = await this.usersService.findOneById(user);

    if (!userObject) throw error('User not found');

    const apiKey = this.setAPIKey(userObject.currentFieldOfStudy);
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error generating text with Dify.AI:', error);
      throw error;
    }
  }

  async renameConversation(
    user: string,
    conversation_id: string,
    name: string,
  ): Promise<string> {
    const url = `${this.baseUrl}/conversations/${conversation_id}/name`;
    const userObject = await this.usersService.findOneById(user);

    if (!userObject) throw error('User not found');

    const apiKey = this.setAPIKey(userObject.currentFieldOfStudy);
    try {
      const response = await axios.post(
        url,
        {
          name: name,
          user: user,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error generating text with Dify.AI:', error);
      throw error;
    }
  }

  async deleteConversation(
    user: string,
    conversation_id: string,
  ): Promise<string> {
    const url = `${this.baseUrl}/conversations/${conversation_id}`;
    const userObject = await this.usersService.findOneById(user);

    if (!userObject) throw error('User not found');

    const apiKey = this.setAPIKey(userObject.currentFieldOfStudy);
    try {
      const response = await axios.delete(
        url,

        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          data: { user: user },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error generating text with Dify.AI:', error);
      throw error;
    }
  }

  async chat(
    user: string,
    query: string,
    mode?: string,
    conversation_id?: string,
    uploadedFiles?: any[],
  ): Promise<any> {
    const url = `${this.baseUrl}/chat-messages`;
    const files = uploadedFiles
      ? uploadedFiles.map((file) => ({
          type: 'image',
          transfer_method: 'local_file',
          upload_file_id: file.id,
        }))
      : [];

    const userObject = await this.usersService.findOneById(user);

    if (!userObject) throw error('User not found');

    const apiKey = this.setAPIKey(userObject.currentFieldOfStudy);

    try {
      const response = await axios.post(
        url,
        {
          inputs: { mode: '' },
          query: query,
          response_mode: 'streaming',
          conversation_id: conversation_id || '',
          user: user,
          files: files,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        },
      );

      return response.data;
    } catch (error) {
      console.error('Error generating text with Dify.AI:', error);
      throw error;
    }
  }

  async regenerateResponse(
    user: string,
    conversation_id: string,
    message: string,
  ): Promise<string> {
    const url = `${this.baseUrl}/chat-messages`;
    const userObject = await this.usersService.findOneById(user);

    if (!userObject) throw error('User not found');

    const apiKey = this.setAPIKey(userObject.currentFieldOfStudy);
    try {
      const response = await axios.post(
        url,
        {
          inputs: {},
          query: `regenerate : '${message}'`,
          response_mode: 'streaming',
          conversation_id: conversation_id,
          user: user,
          files: [],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error generating text with Dify.AI:', error);
      throw error;
    }
  }

  async showMoreOrLessDetails(
    user: string,
    conversation_id: string,
    message: string,
    preference: 'more' | 'less',
  ): Promise<string> {
    const url = `${this.baseUrl}/chat-messages`;
    const userObject = await this.usersService.findOneById(user);

    if (!userObject) throw error('User not found');

    const apiKey = this.setAPIKey(userObject.currentFieldOfStudy);
    try {
      const response = await axios.post(
        url,
        {
          inputs: {},
          query: `show ${preference} details of  : '${message}'`,
          response_mode: 'streaming',
          conversation_id: conversation_id,
          user: user,
          files: [],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error generating text with Dify.AI:', error);
      throw error;
    }
  }

  async rateMessage(
    user: string,
    message_id: string,
    rating: string,
  ): Promise<string> {
    const url = `${this.baseUrl}/messages/${message_id}/feedbacks`;
    const userObject = await this.usersService.findOneById(user);

    if (!userObject) throw error('User not found');

    const apiKey = this.setAPIKey(userObject.currentFieldOfStudy);
    try {
      const response = await axios.post(
        url,
        {
          rating: rating,  
          user: user,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error generating text with Dify.AI:', error);
      throw error;
    }
  }

  async stopGeneration(user: string, task_id: string): Promise<string> {
    const url = `${this.baseUrl}/chat-messages/${task_id}/stop`;
    const userObject = await this.usersService.findOneById(user);

    if (!userObject) throw error('User not found');

    const apiKey = this.setAPIKey(userObject.currentFieldOfStudy);
    try {
      const response = await axios.post(
        url,
        {
          user: user,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error generating text with Dify.AI:', error);
      throw error;
    }
  }

  async uploadfile(file: Express.Multer.File, user: string): Promise<any> {
    const url = `${this.baseUrl}/files/upload`;

    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('file', blob, file.originalname);
    formData.append('user', user);

    const userObject = await this.usersService.findOneById(user);

    if (!userObject) throw error('User not found');

    const apiKey = this.setAPIKey(userObject.currentFieldOfStudy);
    try {
      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error generating text with Dify.AI:', error);
      throw error;
    }
  }
}
