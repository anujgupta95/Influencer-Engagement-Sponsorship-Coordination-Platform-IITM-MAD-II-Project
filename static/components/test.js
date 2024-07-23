const sections = {
    data() {
      return {
        sections: [],
        editIndex: null,
        editSection: {
          sectionName : "",
          description : ""
        },
        message: "",
        messageType: ""
      };
    },
    created() {
      this.fetchSections();
    },
    computed: {
      // Computed property for alert class
      alertClass() {
        return this.messageType === 'error' ? 'flashes-error' : 'flashes-success';
      }
    },
    methods: {
      async fetchSections() {
        const url = window.location.origin + '/api/sections';
        try {
          const response = await fetch(url, {
            headers: {
              "Authentication-Token" : localStorage.getItem('token'),
            },
          });
          const data = await response.json();
          if (!response.ok) {
            this.message = data.message || 'Error fetching sections';
            this.messageType = 'error'; // Set message type to error
            throw new Error(this.message);
          }
          this.sections = data;
          this.message = ''; // Clear any previous messages
        } catch (error) {
          console.error('Error fetching sections:', error);
        }
      },
      async deleteSection(sectionID) {
        const url = window.location.origin + /api/sections/${sectionID};
        try {
          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              "Authentication-Token" : localStorage.getItem('token'),
            },
          });
          if (!response.ok) {
            const data = await response.json();
            this.message = data.message || 'Error deleting section';
            this.messageType = 'error'; // Set message type to error
            throw new Error(this.message);
          }
          this.message = 'Section deleted successfully';
          this.messageType = 'success'; // Set message type to success
          this.fetchSections();
        } catch (error) {
          console.error('Error deleting section:', error);
        }
      },
      startEditSection(index){
        this.editIndex = index;
        this.editedSection = { ...this.sections[index] };
      },
      async saveSection(index) {
        const sectionID = this.sections[index].sectionID;
        const url = window.location.origin + /api/sections/${sectionID};
        try {
          const response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              "Authentication-Token" : localStorage.getItem('token')
            },
            body: JSON.stringify(this.editedSection)
          });
          const data = await response.json();
          if (!response.ok) {
            this.message = data.message || 'Error updating section';
            this.messageType = 'error'; 
            throw new Error(this.message);
          }
          this.message = 'Section updated successfully';
          this.messageType = 'success'; 
          this.sections[index] = { ...this.editedSection }; 
          // { ...this.editedSection, dateCreated: data.dateCreated }; // to update the date 
          this.editIndex = null;
          this.editedSection = {
            sectionName: '',
            description: ''
          };
        } catch (error) {
          console.error('Error updating section:', error);
        }
      },
      cancelEdit() {
        this.editIndex = null;
        this.editedSection = {
          sectionName: '',
          description: ''
        };
      }
    },
    template: `
      <div class="sections m-2">
      <div v-if="message" :class="[alertClass, 'flashes', 'alert', 'alert-dismissable', 'fade', 'show', 'd-flex', 'justify-content-between']" role="alert">
  <h6>{{ message }}</h6>
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        <router-link to="/addSection" class="btn btn-primary mb-2">Add Section</router-link>
        <div class="d-flex flex-wrap gap-3">
          <div v-if="sections && sections.length" v-for="(section, index) in sections" :key="section.sectionID" class="card" style="width: 20rem">
            <div class="card-body">
              <div v-if="editIndex === index">
                <div class="form-floating m-2">
                  <input
                    type="text"
                    class="form-control"
                    v-model="editedSection.sectionName"
                    placeholder="Name of the updated section"
                    required
                  />
                  <label for="floatingInput">Name of the updated section</label>
                </div>
                <div class="form-floating m-2">
                  <input
                    type="text"
                    class="form-control"
                    v-model="editedSection.description"
                    placeholder="Description of the section"
                    required
                  />
                  <label for="floatingInput">Description of the section</label>
                </div>
                <button class="btn btn-primary w-100 py-2" @click="saveSection(index)">Save</button>
                <button class="btn btn-outline-secondary w-100 py-2 mt-1" @click="cancelEdit">Cancel</button>
              </div>
              <div v-else>
                <h5 class="card-title">
                  {{ section.sectionName }}
                  <router-link
                    :to="{ path: '/addBook', query: { section: section.sectionID }}"
                    class="btn btn-outline-primary btn-sm"
                  >Add Book</router-link>
                </h5>
                <p class="card-text">Date created: {{ section.dateCreated }}</p>
                <p class="card-text">{{ section.description }}</p>
                <button class="btn btn-outline-secondary btn-sm" @click="startEditSection(index)">Modify</button>
                <button @click="deleteSection(section.sectionID)" class="btn btn-outline-danger btn-sm">Delete</button>
              </div>
            </div>
          </div>
          <div v-else>
            No sections available.
          </div>
        </div>
      </div>
      `,
    };
  
  export default sections;