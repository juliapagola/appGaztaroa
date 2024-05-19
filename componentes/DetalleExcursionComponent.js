import React, { Component } from "react";
import { Text, View, ScrollView, FlatList, Modal } from "react-native";
import { Card, Icon } from "@rneui/themed";
import { baseUrl, colorGaztaroaOscuro } from "../comun/comun";
import { connect } from "react-redux";
import { postComentario, postFavorito } from "../redux/ActionCreators";
import { Button, Input, Rating } from "react-native-elements";

const mapStateToProps = (state) => {
  return {
    excursiones: state.excursiones,
    comentarios: state.comentarios,
    favoritos: state.favoritos,
  };
};

const mapDispatchToProps = (dispatch) => ({
  postFavorito: (excursionId) => dispatch(postFavorito(excursionId)),
  postComentario: (excursionId, valoracion, autor, comentario, dia) =>
    dispatch(postComentario(excursionId, valoracion, autor, comentario, dia)),
});

function RenderExcursion(props) {
  const excursion = props.excursion;

  if (excursion != null) {
    return (
      <Card>
        <Card.Divider />
        <Card.Image source={{ uri: baseUrl + excursion.imagen }}>
          <Card.Title style={{ color: "lightgray", fontSize: 30 }}>
            {excursion.nombre}
          </Card.Title>
        </Card.Image>
        <Text style={{ margin: 20 }}>{excursion.descripcion}</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Icon
            raised
            reverse
            name={props.favorita ? "heart" : "heart-o"}
            type="font-awesome"
            color="#f50"
            onPress={() =>
              props.favorita
                ? console.log(
                    "La excursión ya se encuentra entre las favoritas"
                  )
                : props.onPress()
            }
          />
          <Icon
            raised
            reverse
            name={"pencil"}
            type="font-awesome"
            color={colorGaztaroaOscuro}
            onPress={() => props.toggleModal()}
          />
        </View>
      </Card>
    );
  } else {
    return <View></View>;
  }
}

function RenderComentario(props) {
  const comentarios = props.comentarios;
  const renderComentarioItem = ({ item, index }) => {
    let fecha = new Date(item.dia.replace(/\s/g, ""));
    return (
      <View key={index} style={{ margin: 10 }}>
        <Text style={{ fontSize: 14 }}>{item.comentario}</Text>
        <Text style={{ fontSize: 12 }}>{item.valoracion} / 5</Text>
        <Text style={{ fontSize: 12 }}>{`-- ${
          item.autor
        }, ${fecha.toLocaleString()}`}</Text>
      </View>
    );
  };
  return (
    <Card>
      <Card.Title>Comentarios</Card.Title>
      <Card.Divider />
      <FlatList
        scrollEnabled={false}
        data={comentarios}
        renderItem={renderComentarioItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </Card>
  );
}

class DetalleExcursion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      valoracion: 5,
      autor: "",
      comentario: "",
      showModal: false,
    };
    this.resetForm = this.resetForm.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.gestionarComentario = this.gestionarComentario.bind(this);
  }

  marcarFavorito(excursionId) {
    this.props.postFavorito(excursionId);
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  resetForm() {
    this.setState({
      valoracion: 3,
      autor: "",
      comentario: "",
      dia: "",
      showModal: false,
    });
  }

  gestionarComentario() {
    const { excursionId } = this.props.route.params;
    const { valoracion, autor, comentario } = this.state;
    const dia = new Date().toISOString();
    this.props.postComentario(excursionId, valoracion, autor, comentario, dia);
    this.resetForm();
  }

  render() {
    const { excursionId } = this.props.route.params;
    return (
      <ScrollView>
        <RenderExcursion
          excursion={this.props.excursiones.excursiones[+excursionId]}
          favorita={this.props.favoritos.favoritos.some(
            (el) => el === excursionId
          )}
          onPress={() => this.marcarFavorito(excursionId)}
          toggleModal={() => this.toggleModal()}
        />
        <RenderComentario
          comentarios={this.props.comentarios.comentarios.filter(
            (comentario) => comentario.excursionId === excursionId
          )}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.showModal}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}>
            <View
              style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 10,
              }}>
              <View>
                <Rating
                  ratingCount={5}
                  startingValue={5}
                  imageSize={60}
                  showRating
                  onFinishRating={this.ratingCompleted}
                />
                <Input
                  inputStyle={{ padding: 10 }}
                  placeholder="Autor"
                  leftIcon={
                    <Icon
                      name="user"
                      type="font-awesome"
                      size={24}
                      color="black"
                    />
                  }
                  value={this.state.autor}
                  onChangeText={(text) => this.setState({ autor: text })}
                />
                <Input
                  inputStyle={{ padding: 10 }}
                  placeholder="Comentario"
                  leftIcon={
                    <Icon
                      name="comment"
                      type="font-awesome"
                      size={24}
                      color="black"
                    />
                  }
                  value={this.state.comentario}
                  onChangeText={(text) => this.setState({ comentario: text })}
                />
                <Button
                  title={"Enviar"}
                  type="clear"
                  onPress={this.gestionarComentario}
                />
                <Button
                  title={"Cancelar"}
                  type="clear"
                  onPress={this.resetForm}
                />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetalleExcursion);
